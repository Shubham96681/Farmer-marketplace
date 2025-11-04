# app/utils/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import random
import string
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")

    def generate_verification_code(self, length=6):
        """Generate a random verification code"""
        return ''.join(random.choices(string.digits, k=length))

    # app/utils/email_service.py - Update the send_verification_email method
    def send_verification_email(self, to_email, verification_code):
        """Send verification email with code - safe for background tasks"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username or "noreply@farmconnect.com"
            msg['To'] = to_email
            msg['Subject'] = "Verify Your FarmConnect Account"

            # Email body
            body = f"""
            <h2>Welcome to FarmConnect! 🚀</h2>
            <p>Thank you for registering. Your verification code is:</p>
            <h1 style="color: #22c55e; font-size: 32px; letter-spacing: 5px;">
                {verification_code}
            </h1>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The FarmConnect Team</p>
            """

            msg.attach(MIMEText(body, 'html'))

            # Send email if SMTP is configured
            if self.smtp_username and self.smtp_password:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)
                print(f"Verification email sent to {to_email}")
                return True
            else:
                # Just print to console if SMTP not configured
                print(f"Mock email sent to {to_email} with code: {verification_code}")
                return True
        except Exception as e:
            print(f"Error sending email to {to_email}: {e}")
            # Don't raise exception, just return False
            return False

    def send_password_reset_email(self, to_email, reset_token):
        """Send password reset email with token"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.smtp_username or "noreply@farmconnect.com"
            msg['To'] = to_email
            msg['Subject'] = "Reset Your FarmConnect Password"

            # Email body
            reset_link = f"http://localhost:3000/reset-password?token={reset_token}"

            body = f"""
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below:</p>
            <p>
                <a href="{reset_link}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Reset Password
                </a>
            </p>
            <p>Or copy this token: <code>{reset_token}</code></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The FarmConnect Team</p>
            """

            msg.attach(MIMEText(body, 'html'))

            # Send email if SMTP is configured
            if self.smtp_username and self.smtp_password:
                with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_username, self.smtp_password)
                    server.send_message(msg)
                print(f"Password reset email sent to {to_email}")
            else:
                # Just print to console if SMTP not configured
                print(f"Mock password reset email sent to {to_email}")
                print(f"Reset token: {reset_token}")

            return True
        except Exception as e:
            print(f"Error sending reset email: {e}")
            # Fallback to mock email
            print(f"Mock password reset email sent to {to_email}")
            print(f"Reset token: {reset_token}")
            return True

# Create global instance
email_service = EmailService()