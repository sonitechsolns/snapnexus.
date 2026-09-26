#!/usr/bin/env node
/*
  SnapNexus · Appwrite permission setup
  -------------------------------------
  Grants the collection/bucket permissions the new site needs, without removing anything
  that's already there. Run it from your own computer. Your API key never leaves it.

    1. Appwrite Console > your project > Overview > API keys > Create API key
       Scopes: databases.read, databases.write (or collections.read/collections.write),
               buckets.read, buckets.write, users.read
    2. Dry run (shows what would change, changes nothing):
         APPWRITE_API_KEY=xxxx node setup/appwrite-setup.mjs
    3. Apply:
         APPWRITE_API_KEY=xxxx node setup/appwrite-setup.mjs --apply
    4. Delete the API key afterwards if you won't need it again.

  Needs Node 18 or newer. No npm install needed.
*/
const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT = '69d8eda100264f4e42ae';
const DB = '69d8f0b0003c6d1e4d93';
const BUCKET = '69d8f2b800397ad57e50';
const ADMIN_EMAILS = ['sooperfast.net@yahoo.com'];

const KEY = process.env.APPWRITE_API_KEY;
const APPLY = process.argv.includes('--apply');
if (!KEY) { console.error('Set APPWRITE_API_KEY first. See the notes at the top of this file.'); process.exit(1); }

async function api(method, path, body) {
  const res = await fetch(ENDPOINT + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY },
    body: body ? JSON.stringify(body) : undefined
  });
  const txt = await res.text();
  let json; try { json = JSON.parse(txt); } catch { json = { raw: txt }; }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${json.message || txt}`);
  return json;
}

const any = r => `${r}("any")`, users = r => `${r}("users")`, user = (r, id) => `${r}("user:${id}")`;

async function adminIds() {
  const ids = [];
  for (const email of ADMIN_EMAILS) {
    const r = await api('GET', `/users?search=${encodeURIComponent(email)}`);
    const u = (r.users || []).find(x => String(x.email).toLowerCase() === email.toLowerCase());
    if (u) ids.push(u.$id); else console.warn(`! No account found for ${email}. Sign up on the site with that email, then run this again.`);
  }
  return ids;
}

function merge(current, wanted) { const set = new Set(current); wanted.forEach(p => set.add(p)); return [...set]; }
function show(label, before, after) {
  const added = after.filter(p => !before.includes(p));
  console.log(`\n${label}`);
  console.log('  now:   ' + (before.join(', ') || '(none)'));
  console.log('  add:   ' + (added.join(', ') || '(nothing, already fine)'));
  return added.length > 0;
}

(async () => {
  console.log(APPLY ? 'Applying changes…' : 'Dry run (nothing will change). Add --apply to make the changes.');
  const admins = await adminIds();
  console.log('Admin user IDs: ' + (admins.join(', ') || '(none found)') + '  → also put these in ADMIN_USER_IDS in config.js');

  const plan = [
    { kind: 'collection', id: 'EventsTable', want: [any('read'), any('create'), ...admins.map(id => user('update', id))],
      why: 'Hosts create events; guests & walls read them; admin confirms payments on any event.' },
    { kind: 'collection', id: 'uploads', want: [any('read'), any('create'), users('update'), users('delete')],
      why: 'Guests upload; walls read; hosts hide, pin and delete photos.' },
    { kind: 'collection', id: 'groups', want: [any('read'), any('create')],
      why: 'Guests create and join private groups.' },
    { kind: 'bucket', id: BUCKET, want: [any('read'), any('create'), users('update'), users('delete')],
      why: 'Guests upload files; hosts delete photos and upload a Pro logo; admin manages wall ads.' }
  ];

  for (const p of plan) {
    if (p.kind === 'collection') {
      const c = await api('GET', `/databases/${DB}/collections/${p.id}`);
      const next = merge(c.$permissions, p.want);
      if (show(`Collection "${c.name}" (${p.id}): ${p.why}`, c.$permissions, next) && APPLY) {
        await api('PUT', `/databases/${DB}/collections/${p.id}`, { name: c.name, permissions: next, documentSecurity: c.documentSecurity, enabled: c.enabled });
        console.log('  ✓ updated');
      }
    } else {
      const b = await api('GET', `/storage/buckets/${p.id}`);
      const next = merge(b.$permissions, p.want);
      if (show(`Bucket "${b.name}" (${p.id}): ${p.why}`, b.$permissions, next) && APPLY) {
        await api('PUT', `/storage/buckets/${p.id}`, {
          name: b.name, permissions: next, fileSecurity: b.fileSecurity, enabled: b.enabled,
          maximumFileSize: b.maximumFileSize, allowedFileExtensions: b.allowedFileExtensions,
          compression: b.compression, encryption: b.encryption, antivirus: b.antivirus
        });
        console.log('  ✓ updated');
      }
      if (b.maximumFileSize && b.maximumFileSize < 16 * 1024 * 1024) console.warn(`  ! Max file size is ${(b.maximumFileSize / 1048576).toFixed(1)} MB. Guests can send 15 MB videos, so raise it to at least 16 MB in the console.`);
      if (Array.isArray(b.allowedFileExtensions) && b.allowedFileExtensions.length) {
        const need = ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'webm', 'gif', 'svg', 'webp'].filter(x => !b.allowedFileExtensions.includes(x));
        if (need.length) console.warn(`  ! Allowed extensions list is missing: ${need.join(', ')}. Add them in the console (or clear the list to allow all).`);
      }
    }
  }
  console.log(APPLY ? '\nDone.' : '\nDry run finished. Run again with --apply to make these changes.');
})().catch(e => { console.error('\n✗ ' + e.message); process.exit(1); });
