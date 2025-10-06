#!/bin/sh
set -e

echo "📦 Installing dependencies..."
npm install

SCHEMA_PATH="prisma/schema.prisma"
MIGRATIONS_DIR="prisma/migrations"

echo "🔍 Checking for Prisma migrations..."

# 1️⃣ If no migrations exist, create the initial migration
if [ ! -d "$MIGRATIONS_DIR" ] || [ -z "$(ls -A $MIGRATIONS_DIR 2>/dev/null)" ]; then
  echo "⚙️  No migrations found — generating initial migration..."
  npx prisma migrate dev --name init --schema="$SCHEMA_PATH"
else
  # 2️⃣ If migrations exist, apply them
  echo "🛠️  Applying existing migrations..."
  npx prisma migrate deploy --schema="$SCHEMA_PATH"
fi

# 3️⃣ Always regenerate the Prisma Client
echo "🔁 Generating Prisma client..."
npx prisma generate --schema="$SCHEMA_PATH"

# 4️⃣ Seed the database (if applicable)
echo "🌱 Seeding database..."
npm run db:seed || echo "⚠️  Seeding failed or skipped (this might be fine)."

# 5️⃣ Start the backend server
echo "✅ Starting backend server..."
npm run dev
