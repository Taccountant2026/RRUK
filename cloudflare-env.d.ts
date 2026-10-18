declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_EMAIL?: string;
    STORE_SECRET?: string;
    PUBLIC_ORIGIN?: string;
    SITE_INDEXABLE?: string;
  }
}
