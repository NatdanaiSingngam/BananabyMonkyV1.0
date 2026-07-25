-- Migration number: 0002
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    icon TEXT NOT NULL DEFAULT 'ri-list-line',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_type ON categories (type);
