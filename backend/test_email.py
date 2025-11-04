# test_email.py
from app.utils.email_service import email_service

def test_email():
    try:
        print("🧪 Testing email service...")
        result = email_service.send_verification_email("test@example.com", "123456")
        print(f"✅ Email test result: {result}")
    except Exception as e:
        print(f"❌ Email test failed: {e}")

if __name__ == "__main__":
    test_email()