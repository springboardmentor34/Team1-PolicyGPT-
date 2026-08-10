import logging
import httpx
from app.core.config import settings

logger = logging.getLogger("policygpt")

def send_password_reset_email(to_email: str, raw_reset_token: str) -> bool:
    """
    Dispatches a password reset email to the user via Resend API.
    Does NOT log the raw token or API key.
    """
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is not configured in settings. Email skipped.")
        return False

    reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={raw_reset_token}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your PolicyGPT Password</title>
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }}
        .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-top: 4px solid #FF9933; }}
        .header {{ background-color: #000080; color: #ffffff; padding: 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 22px; letter-spacing: 0.5px; }}
        .content {{ padding: 30px; color: #333333; line-height: 1.6; }}
        .btn {{ display: inline-block; background-color: #FF9933; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; text-align: center; }}
        .footer {{ background-color: #f8f9fa; border-top: 1px solid #e9ecef; padding: 16px; text-align: center; font-size: 12px; color: #6c757d; }}
        .note {{ font-size: 13px; color: #6c757d; background: #f8f9fa; padding: 12px; border-left: 3px solid #000080; border-radius: 4px; margin-top: 20px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PolicyGPT Intelligence Platform</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset the password for your account associated with <strong>{to_email}</strong>.</p>
          <p>Click the button below to set a new password:</p>
          <div style="text-align: center;">
            <a href="{reset_link}" class="btn">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your web browser:</p>
          <p style="word-break: break-all; font-size: 13px; color: #000080;"><a href="{reset_link}">{reset_link}</a></p>
          <div class="note">
            <strong>Security Notice:</strong> This link is valid for <strong>15 minutes</strong> and can only be used once. If you did not request a password reset, please ignore this email or contact support.
          </div>
        </div>
        <div class="footer">
          &copy; PolicyGPT: Government Policy & Public Scheme Intelligence Platform. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """

    payload = {
        "from": settings.MAIL_FROM,
        "to": [to_email],
        "subject": "Reset Your PolicyGPT Password",
        "html": html_content
    }

    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post("https://api.resend.com/emails", json=payload, headers=headers)
            if response.status_code in (200, 201):
                logger.info(f"Password reset email successfully sent via Resend to {to_email}")
                return True
            else:
                logger.error(f"Resend API error ({response.status_code}): {response.text}")
                return False
    except Exception as e:
        logger.error(f"Failed to dispatch password reset email via Resend: {e}")
        return False
