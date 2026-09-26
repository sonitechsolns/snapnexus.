# SnapNexus v2

Static site on Appwrite, using the same backend and IDs as the previous site. Every page is one self-contained `.html` file with its styles, scripts and icons built in. The only shared files are `config.js` (settings), `favicon.png` and `logo.png`. Push this folder to the GitHub repo behind snapnexus.in (GitHub Pages; `CNAME` is included).

To change the logo, replace `logo.png`. To change settings, edit `config.js`.

## Before going live (about 10 minutes)
1. **`config.js`**: paste your UPI ID where it says `PASTE_YOUR_UPI_ID_HERE`. The checkout QR codes (₹49 and ₹999) are generated from it automatically, with the amount and a payment reference (like `SNX-4K9Q2M`) filled in. Your UPI ID is never printed on the page (`UPI_SHOW_ID: false`).
   - **About the name on the payer's phone:** UPI apps always show the name registered with the bank for the UPI ID being paid. It's an anti-fraud rule, and no website or QR setting can hide it. To show "SnapNexus" instead of your personal name, use a **business/merchant UPI ID** whose display name is SnapNexus. PhonePe Business, Paytm for Business and BharatPe let sole proprietors set one up with PAN and Aadhaar. Paste that ID here instead; nothing else changes.
2. **Appwrite permissions**: run the setup script from this folder on your Mac. It only adds permissions and never removes any.
   - Appwrite Console > project > Overview > API keys > Create key with the scopes `databases.read`, `databases.write`, `buckets.read`, `buckets.write` and `users.read`.
   - Dry run: `APPWRITE_API_KEY=your_key node setup/appwrite-setup.mjs`
   - Apply: `APPWRITE_API_KEY=your_key node setup/appwrite-setup.mjs --apply`
   - Delete the key afterwards.
   - What it does: lets your admin account confirm payments on any event, lets hosts hide, pin and delete guest photos, and lets hosts upload a Pro logo.
3. **Admin ID**: sign in, open `/admin.html` and copy the ID it shows into `ADMIN_USER_IDS` in `config.js`. Then press **Run setup check**. Every line should be green.
4. **Storage bucket**: make sure the max file size is at least 16 MB, since guests can send 15 MB videos. The script warns you if it isn't.
5. **Password reset emails** use Appwrite's built-in mailer, so nothing needs setting up. The link opens `reset.html` on your domain.
6. **Deploy**: replace the site files with this folder's contents. The `setup/` folder is safe to deploy, because it contains no secrets.

## Analytics (PostHog)
The same PostHog project as before (`assets/analytics.js`). Hosts are identified by their Appwrite user ID only; no emails are sent. The site sends these events:
`host_signed_up`, `host_signed_in`, `event_created`, `checkout_opened`, `payment_submitted`, `theme_saved`, `zip_downloaded`, `upload_deleted`, `logo_uploaded`, `event_ended`, `wall_opened`, `guest_upload`, `group_created`, `group_joined`, `wall_layout_saved`, `password_reset_requested`, `password_reset_done`.
Test mode (`?mock=1`) sends nothing.

## Test without touching live data
Add `?mock=1` to any page URL. Everything runs on fake data stored in your browser.
- Demo host: `host@example.com` / `password123`
- Admin: `sooperfast.net@yahoo.com` / `password123` (test mode only)
- Leave test mode with the red "exit" pill, or `?mock=0`.

## Pages
| Page | What it is |
|---|---|
| `index.html` | Landing page |
| `login.html` | Host sign-in, event list, new event, Pro checkout |
| `dashboard.html` | Event control: QR/print, look, moderation, ZIP, groups, UPI upgrade, Pro logo |
| `app.html` | Guest upload page (from the QR) |
| `tv.html` | Live wall for the TV/projector |
| `admin.html` | Confirm UPI payments, grant Pro, change plans, wall ads, stats |
| `reset.html` | Set a new password from the emailed link |
| `privacy.html`, `terms.html`, `security.html` | Policies |
| `tv_2.html`, `vip_dashboard.html` | Redirects so old links keep working |

## How data is stored (no new Appwrite collections needed)
- Events: `EventsTable` docs with `status` `active`/`ended`. `theme` is `<look>|w:<layout>:<secs>:<qr>:<media>`, where look is a preset name or `c:BG:ACCENT:FONT` and layout is `auto|spotlight|slideshow|split|grid`, e.g. `wedding|w:slideshow:10:corner:all`. Older events without the `|w:` part use Auto, 6s, sidebar QR and photos plus videos.
- Payment requests: `EventsTable` docs with `status` `payment_pending|payment_done|payment_rejected`, where `eventName` is `plan|amount|UTR|eventId`.
- Pro subscriptions: `EventsTable` docs with `status` `subscription`, where `eventName` is `until|<ms timestamp>`.
- Uploads/groups: same fields as before (`file_id`, `event_id`, `file_url`, `is_public_wall_allowed`, `group_id`, `is_pinned`).
- Wall ads: storage files `global_ad_1..3`, the same as before.
- Pro logos: storage file `logo_<eventId>` (no new database attribute needed).
- Pro subscriptions are only trusted if an account listed in `ADMIN_USER_IDS` created them.

## Known limits (no server yet)
- Hosts can edit their own event document, so a technical host could switch their own event's `tier` using the browser console. Closing this needs an Appwrite Function that does event updates on the host's behalf, which is the next step if abuse appears.
- "Users" can update and delete uploads, so any signed-in account could in theory remove photos from another event through the API. Per-event Teams would lock this down.
