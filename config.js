// config.js - SnapNexus Unified Configuration (place at root of your domain)
const SnapNexus = {
    ENDPOINT: 'https://cloud.appwrite.io/v1',
    PROJECT_ID: '69d8eda100264f4e42ae',
    BUCKET_ID: '69d8f2b800397ad57e50',
    DATABASE_ID: '69d8f0b0003c6d1e4d93',
    COLLECTION_ID: 'EventsTable',
    
    // Helper: build absolute URL for internal links
    resolveUrl: function(relativePath) {
        if (relativePath.startsWith('/')) {
            return window.location.origin + relativePath;
        }
        return window.location.origin + '/' + relativePath;
    },
    
    debug: false,  // set to true only for debugging
    log: function(...args) {
        if (this.debug) console.log('[SnapNexus]', ...args);
    },
    error: function(...args) {
        console.error('[SnapNexus]', ...args);
    }
};

window.SnapNexus = SnapNexus;

// Global Appwrite Initialization (Ensures no duplicate declarations in HTML files)
const client = new Appwrite.Client()
    .setEndpoint(SnapNexus.ENDPOINT)
    .setProject(SnapNexus.PROJECT_ID);

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const storage = new Appwrite.Storage(client);

// Expose cfg globally so your existing scripts don't break
const cfg = SnapNexus;