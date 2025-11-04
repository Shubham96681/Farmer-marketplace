# migrations/add_bio_location_to_users.py
from app.database import Base, engine, SessionLocal
from sqlalchemy import text


def upgrade():
    # Add bio column
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN bio TEXT NULL
        """))

        # Add location column
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN location VARCHAR(255) NULL
        """))
        conn.commit()


def downgrade():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users DROP COLUMN bio"))
        conn.execute(text("ALTER TABLE users DROP COLUMN location"))
        conn.commit()


if __name__ == "__main__":
    upgrade()
    print("✅ Added bio and location columns to users table")