from app.database import Base, engine

print("⚙️ Recreating tables...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("✅ Tables recreated successfully")
