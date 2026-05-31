#!/usr/bin/env python3
"""
Data Migration Script — Migrasi data dari monolith ke microservices.

Gunakan script ini jika Anda punya data di database monolith (single database)
dan ingin memindahkannya ke struktur microservices (separate databases).

Struktur:
- Monolith DB: users + items dalam 1 database
- Auth DB: users table saja
- Cuti DB: items table (dengan owner_id reference ke auth db user)

Usage:
    python scripts/migrate_data.py

Configuration:
    Edit DATABASE_URLS di bawah untuk sesuaikan dengan environment Anda.
    Atau gunakan environment variables:
    - MONOLITH_DB_URL
    - AUTH_DB_URL
    - CUTI_DB_URL
"""
import os
import sys
import logging
from sqlalchemy import create_engine, text
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# =====================================================================
# DATABASE CONFIGURATION
# =====================================================================

# For local host access (outside Docker)
MONOLITH_DB_URL = os.getenv(
    "MONOLITH_DB_URL",
    "postgresql://postgres:postgres123@localhost:5432/cloudapp"
)

AUTH_DB_URL = os.getenv(
    "AUTH_DB_URL",
    "postgresql://postgres:postgres123@localhost:5432/auth_db"
)

CUTI_DB_URL = os.getenv(
    "CUTI_DB_URL",
    "postgresql://postgres:postgres123@localhost:5433/cuti_db"
)

# For Docker Compose access (inside containers)
MONOLITH_DB_URL_DOCKER = "postgresql://postgres:postgres123@monolith-db:5432/cloudapp"
AUTH_DB_URL_DOCKER = "postgresql://postgres:postgres123@auth-db:5432/auth_db"
CUTI_DB_URL_DOCKER = "postgresql://postgres:postgres123@cuti-db:5432/cuti_db"


def test_connections(monolith_engine, auth_engine, cuti_engine):
    """Test koneksi ke semua database."""
    logger.info("=" * 70)
    logger.info("TESTING DATABASE CONNECTIONS")
    logger.info("=" * 70)
    
    databases = [
        ("Monolith DB", monolith_engine),
        ("Auth DB", auth_engine),
        ("Cuti DB", cuti_engine),
    ]
    
    for name, engine in databases:
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info(f"✅ {name}: Connected")
        except Exception as e:
            logger.error(f"❌ {name}: Failed - {e}")
            return False
    
    return True


def migrate():
    """Main migration function."""
    logger.info("=" * 70)
    logger.info("DATA MIGRATION: Monolith → Microservices")
    logger.info("=" * 70)
    logger.info(f"Start time: {datetime.now()}")
    
    # Create engines
    logger.info("\nInitializing database connections...")
    try:
        monolith = create_engine(MONOLITH_DB_URL)
        auth_db = create_engine(AUTH_DB_URL)
        cuti_db = create_engine(CUTI_DB_URL)
    except Exception as e:
        logger.error(f"Failed to create database engines: {e}")
        logger.info("\n💡 Tip: Make sure all databases are running and accessible.")
        return False
    
    # Test connections
    if not test_connections(monolith, auth_db, cuti_db):
        logger.error("\n❌ Failed to connect to one or more databases.")
        logger.info("\n💡 Tips:")
        logger.info("1. If using Docker: docker compose up -d")
        logger.info("2. If using local PostgreSQL: ensure services are running")
        logger.info("3. Check credentials in this script match your environment")
        return False
    
    # Step 1: Migrate users to auth_db
    logger.info("\n" + "=" * 70)
    logger.info("[1/2] MIGRATING USERS → auth_db")
    logger.info("=" * 70)
    
    try:
        with monolith.connect() as src:
            # Check if table exists
            try:
                users = src.execute(
                    text("SELECT id, email, name, hashed_password, created_at FROM users")
                ).fetchall()
            except Exception as e:
                logger.warning(f"Could not fetch users from monolith: {e}")
                logger.info("Skipping user migration (table might not exist).")
                users = []
        
        if users:
            logger.info(f"Found {len(users)} users in monolith DB")
            
            with auth_db.connect() as dst:
                migrated = 0
                skipped = 0
                
                for user in users:
                    try:
                        # Use ON CONFLICT to handle duplicates
                        dst.execute(
                            text("""
                                INSERT INTO users (id, email, name, hashed_password, created_at)
                                VALUES (:id, :email, :name, :hashed_password, :created_at)
                                ON CONFLICT (id) DO UPDATE SET
                                  email = :email,
                                  name = :name,
                                  hashed_password = :hashed_password
                            """),
                            {
                                "id": user.id,
                                "email": user.email,
                                "name": user.name,
                                "hashed_password": user.hashed_password,
                                "created_at": user.created_at,
                            }
                        )
                        migrated += 1
                    except Exception as e:
                        logger.warning(f"Skipped user {user.email}: {e}")
                        skipped += 1
                
                dst.commit()
            
            logger.info(f"✅ Migrated {migrated} users (skipped {skipped})")
        else:
            logger.info("No users found in monolith DB")
    
    except Exception as e:
        logger.error(f"❌ User migration failed: {e}")
        return False
    
    # Step 2: Migrate items to cuti_db
    logger.info("\n" + "=" * 70)
    logger.info("[2/2] MIGRATING ITEMS → cuti_db")
    logger.info("=" * 70)
    
    try:
        with monolith.connect() as src:
            # Check if table exists
            try:
                items = src.execute(
                    text("""
                        SELECT id, name, description, price, quantity, 
                               owner_id, created_at, updated_at 
                        FROM items
                    """)
                ).fetchall()
            except Exception as e:
                logger.warning(f"Could not fetch items from monolith: {e}")
                logger.info("Skipping item migration (table might not exist).")
                items = []
        
        if items:
            logger.info(f"Found {len(items)} items in monolith DB")
            
            with cuti_db.connect() as dst:
                migrated = 0
                skipped = 0
                
                for item in items:
                    try:
                        # Use ON CONFLICT to handle duplicates
                        dst.execute(
                            text("""
                                INSERT INTO items 
                                  (id, name, description, price, quantity, owner_id, created_at, updated_at)
                                VALUES 
                                  (:id, :name, :description, :price, :quantity, :owner_id, :created_at, :updated_at)
                                ON CONFLICT (id) DO UPDATE SET
                                  name = :name,
                                  description = :description,
                                  price = :price,
                                  quantity = :quantity,
                                  updated_at = :updated_at
                            """),
                            {
                                "id": item.id,
                                "name": item.name,
                                "description": item.description,
                                "price": item.price,
                                "quantity": item.quantity,
                                "owner_id": item.owner_id,
                                "created_at": item.created_at,
                                "updated_at": item.updated_at,
                            }
                        )
                        migrated += 1
                    except Exception as e:
                        logger.warning(f"Skipped item {item.id}: {e}")
                        skipped += 1
                
                dst.commit()
            
            logger.info(f"✅ Migrated {migrated} items (skipped {skipped})")
        else:
            logger.info("No items found in monolith DB")
    
    except Exception as e:
        logger.error(f"❌ Item migration failed: {e}")
        return False
    
    logger.info("\n" + "=" * 70)
    logger.info("✅ MIGRATION COMPLETED SUCCESSFULLY!")
    logger.info("=" * 70)
    logger.info(f"End time: {datetime.now()}")
    
    return True


def main():
    """Entry point."""
    if len(sys.argv) > 1 and sys.argv[1] == "--docker":
        logger.info("Using Docker Compose database URLs...")
        global MONOLITH_DB_URL, AUTH_DB_URL, CUTI_DB_URL
        MONOLITH_DB_URL = MONOLITH_DB_URL_DOCKER
        AUTH_DB_URL = AUTH_DB_URL_DOCKER
        CUTI_DB_URL = CUTI_DB_URL_DOCKER
    
    try:
        success = migrate()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.warning("\n⚠️  Migration interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Unexpected error: {e}")
        logger.info("\n💡 For debugging, check logs above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
