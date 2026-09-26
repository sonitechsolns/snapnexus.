// config.js - SnapNexus unified configuration (lives at the root of the domain)
// Edit the values in the "Business settings" block below. Nothing else needs changing.
const SnapNexus = {
    // ── Appwrite (unchanged from the previous site) ──────────────────
    ENDPOINT: 'https://cloud.appwrite.io/v1',
    PROJECT_ID: '69d8eda100264f4e42ae',
    BUCKET_ID: '69d8f2b800397ad57e50',
    DATABASE_ID: '69d8f0b0003c6d1e4d93',
    COLLECTION_ID: 'EventsTable',
    GROUPS_COLLECTION_ID: 'groups',
    UPLOADS_COLLECTION_ID: 'uploads',

    // ── Business settings ───────────────────────────────────────────
    // ── UPI payments (the only payment method for now) ──────────────
    // ▼▼▼ PASTE YOUR UPI ID BETWEEN THE QUOTES (e.g. 'snapnexus@ybl') ▼▼▼
    UPI_ID: 'PASTE_YOUR_UPI_ID_HERE',
    // ▲▲▲ The checkout QR code is generated from this, with the exact amount filled in. ▲▲▲
    // Payee label sent inside the QR. NOTE: UPI apps show the name REGISTERED with the bank
    // for this UPI ID and ignore this label for personal accounts. To show "SnapNexus",
    // use a business/merchant UPI ID whose display name is SnapNexus (see README).
    UPI_PAYEE_NAME: 'SnapNexus',
    // false = your UPI ID is never printed on the checkout page (only inside the QR)
    UPI_SHOW_ID: false,
    CONTACT_EMAIL: 'sooperfast.net@yahoo.com',
    // Accounts allowed into admin.html (must also be signed in with this email)
    ADMIN_EMAILS: ['sooperfast.net@yahoo.com'],
    // Appwrite user IDs of admin accounts (shown on admin.html). When set, only Pro
    // subscriptions granted by these accounts are honoured, so nobody can fake one.
    ADMIN_USER_IDS: [],

    // Plans. The keys are what gets stored in the Events "tier" attribute.
    // 'starter' is kept as the free-trial key so events created on the old site still work.
    PLANS: {
        starter: { name: 'Free Trial',   price: 0,   unit: '1 hour',  ads: true,  trialMinutes: 60, downloadHours: 24 },
        single:  { name: 'Single Event', price: 49,  unit: 'event',   ads: false, downloadDays: 30 },
        pro:     { name: 'Pro Creator',  price: 999, unit: 'month',   ads: false, downloadDays: 30, unlimitedEvents: true, customLogo: true, pinToWall: true }
    },
    // How many free-trial events one account can create (set 0 for unlimited)
    TRIAL_PER_ACCOUNT: 1,
    // Old plan names from the previous site and what they map to now
    LEGACY_TIERS: { premium: 'pro', vip: 'pro' },

    // Upload limits for guests
    MAX_FILES: 5,
    MAX_VIDEO_MB: 15,
    MAX_VIDEO_SECONDS: 15,

    // ── Helpers ─────────────────────────────────────────────────────
    resolveUrl: function (relativePath) {
        if (relativePath.startsWith('/')) return window.location.origin + relativePath;
        var base = window.location.href.replace(/[?#].*$/, '').replace(/[^/]*$/, '');
        return base + relativePath;
    },

    debug: false,
    log: function (...args) { if (this.debug) console.log('[SnapNexus]', ...args); },
    error: function (...args) { console.error('[SnapNexus]', ...args); }
};

window.SnapNexus = SnapNexus;
window.cfg = SnapNexus;
