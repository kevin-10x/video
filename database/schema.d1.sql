-- Cloudflare D1 Schema for AfroToon AI
-- Run with: wrangler d1 execute afrotoon-db --file=./database/schema.d1.sql --env=preview

-- Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    email_verified INTEGER,
    name TEXT,
    username TEXT UNIQUE,
    avatar TEXT,
    bio TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'USER',
    status TEXT DEFAULT 'PENDING_VERIFICATION',
    credits INTEGER DEFAULT 100,
    total_credits_used INTEGER DEFAULT 0,
    credits_reset_at INTEGER,
    two_factor_enabled INTEGER DEFAULT 0,
    two_factor_secret TEXT,
    last_login_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- Accounts (OAuth)
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, provider_account_id)
);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- Sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);

-- Verification Tokens
CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires INTEGER NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- User Preferences
CREATE TABLE user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system',
    language TEXT DEFAULT 'en',
    notifications TEXT DEFAULT '{}',
    default_style TEXT,
    default_quality TEXT DEFAULT 'MEDIUM_720P',
    auto_save INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- API Keys
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    key_prefix TEXT NOT NULL,
    permissions TEXT DEFAULT '[]',
    last_used_at INTEGER,
    expires_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    revoked_at INTEGER
);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- Projects
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT',
    thumbnail TEXT,
    duration REAL,
    fps INTEGER DEFAULT 30,
    width INTEGER,
    height INTEGER,
    style TEXT,
    style_config TEXT DEFAULT '{}',
    settings TEXT DEFAULT '{}',
    metadata TEXT DEFAULT '{}',
    progress INTEGER DEFAULT 0,
    current_job_id TEXT,
    error TEXT,
    credits_used INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 0,
    share_token TEXT UNIQUE,
    completed_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_share_token ON projects(share_token);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Jobs
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    priority INTEGER DEFAULT 0,
    input TEXT DEFAULT '{}',
    output TEXT DEFAULT '{}',
    progress INTEGER DEFAULT 0,
    current_step TEXT,
    total_steps INTEGER DEFAULT 1,
    error TEXT,
    logs TEXT DEFAULT '[]',
    worker_id TEXT,
    started_at INTEGER,
    completed_at INTEGER,
    failed_at INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    depends_on_id TEXT REFERENCES jobs(id),
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX idx_jobs_project_id ON jobs(project_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_depends_on ON jobs(depends_on_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Assets
CREATE TABLE assets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    duration REAL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata TEXT DEFAULT '{}',
    tags TEXT DEFAULT '[]',
    is_public INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_project_id ON assets(project_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_tags ON assets(tags);
CREATE INDEX idx_assets_created_at ON assets(created_at);

-- Exports
CREATE TABLE exports (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    format TEXT DEFAULT 'MP4',
    quality TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    duration REAL NOT NULL,
    size INTEGER,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    watermark INTEGER DEFAULT 1,
    includes_audio INTEGER DEFAULT 1,
    subtitles TEXT DEFAULT '[]',
    status TEXT DEFAULT 'PENDING',
    error TEXT,
    download_count INTEGER DEFAULT 0,
    expires_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX idx_exports_project_id ON exports(project_id);
CREATE INDEX idx_exports_user_id ON exports(user_id);
CREATE INDEX idx_exports_status ON exports(status);
CREATE INDEX idx_exports_created_at ON exports(created_at);

-- Notifications
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT DEFAULT '{}',
    read INTEGER DEFAULT 0,
    read_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Subscriptions
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    current_period_start INTEGER NOT NULL,
    current_period_end INTEGER NOT NULL,
    cancel_at_period_end INTEGER DEFAULT 0,
    cancelled_at INTEGER,
    trial_end INTEGER,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    metadata TEXT DEFAULT '{}',
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- System Config
CREATE TABLE system_config (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Audit Logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    changes TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at AFTER UPDATE ON users BEGIN
    UPDATE users SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_projects_updated_at AFTER UPDATE ON projects BEGIN
    UPDATE projects SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_jobs_updated_at AFTER UPDATE ON jobs BEGIN
    UPDATE jobs SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_assets_updated_at AFTER UPDATE ON assets BEGIN
    UPDATE assets SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_exports_updated_at AFTER UPDATE ON exports BEGIN
    UPDATE exports SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_subscriptions_updated_at AFTER UPDATE ON subscriptions BEGIN
    UPDATE subscriptions SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_system_config_updated_at AFTER UPDATE ON system_config BEGIN
    UPDATE system_config SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;

-- Seed System Config
INSERT OR IGNORE INTO system_config (id, key, value) VALUES 
('cfg_african_styles', 'african_styles', '[{"id":"AFRICAN_CARTOON","name":"African Cartoon","region":"Pan-African","colors":["#E67E22","#27AE60","#2980B9","#E74C3C"],"patterns":["cultural_fusion","vibrant_outlines"]},{"id":"MAASAI_STYLE","name":"Maasai Style","region":"East Africa","colors":["#C0392B","#2980B9","#FFFFFF"],"patterns":["geometric_beadwork","checkered_shuka"]},{"id":"YORUBA_STYLE","name":"Yoruba Style","region":"West Africa","colors":["#8B4513","#DAA520","#FFD700"],"patterns":["adire_indigo","royal_motifs"]},{"id":"ZULU_STYLE","name":"Zulu Style","region":"Southern Africa","colors":["#000000","#FFFFFF","#FF0000"],"patterns":["shield_patterns","beadwork"]},{"id":"KENTE_STYLE","name":"Kente Style","region":"Ghana","colors":["#FFD700","#006400","#DC143C"],"patterns":["woven_geometric","strip_weaving"]},{"id":"ANKARA_STYLE","name":"Ankara Style","region":"West Africa","colors":["#FF6B35","#F7DC6F","#2ECC71"],"patterns":["wax_prints","bold_florals"]}]'),

('cfg_animation_styles', 'animation_styles', '[{"id":"ANIME","name":"Anime","description":"Japanese animation style"},{"id":"COMIC","name":"Comic Book","description":"Bold lines, halftone effects"},{"id":"PIXAR_STYLE","name":"Pixar Style","description":"3D animated movie look"},{"id":"DISNEY_STYLE","name":"Disney Style","description":"Classic Disney animation"},{"id":"AFRICAN_CARTOON","name":"African Cartoon","description":"Authentic African art style"},{"id":"MANGA","name":"Manga","description":"Black & white manga style"},{"id":"CHIBI","name":"Chibi","description":"Cute super-deformed style"},{"id":"GHIBLI_STYLE","name":"Ghibli Style","description":"Studio Ghibli aesthetic"},{"id":"WATERCOLOR","name":"Watercolor","description":"Soft painted look"},{"id":"OIL_PAINTING","name":"Oil Painting","description":"Textured artistic style"},{"id":"PENCIL_SKETCH","name":"Pencil Sketch","description":"Hand-drawn sketch effect"},{"id":"CLAYMATION","name":"Claymation","description":"Stop-motion clay look"}]'),

('cfg_credit_costs', 'credit_costs', '{"VIDEO_TO_CARTOON_BASE":15,"TEXT_TO_CARTOON_BASE":10,"IMAGE_TO_CARTOON_BASE":5,"STYLE_AFRICAN_CARTOON":5,"STYLE_PREMIUM":8,"QUALITY_1080P":5,"QUALITY_2K":10,"QUALITY_4K":20,"LIP_SYNC":10,"SUBTITLES":3,"BACKGROUND_REPLACE":8,"AUDIO_ENHANCE":3,"UPSCALE":5}');