// config.js - SnapNexus Unified Configuration (place at root of your domain)
window.SnapNexus = {
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