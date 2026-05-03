export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Bitchat</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="https://www.freepik.com/free-vector/luxury-blue-golden-background_23916547.htm#fromView=keyword&page=1&position=17&uuid=bcdcc93e-8e21-491e-85bb-b547586a17c5&from_element=categories_trends&query=Blue+background" alt="Messenger Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 50%; background-color: white; padding: 10px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Welcome to Bitchat!</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #5B86E5;"><strong>Hello ${name},</strong></p>
      <p>We're excited to have you join our messaging platform! Messenger connects you with friends, family, and colleagues in real-time, no matter where they are.</p>
      
      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #36D1DC;">
        <p style="font-size: 16px; margin: 0 0 15px 0;"><strong>Get started in just a few steps:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;">Set up your profile picture</li>
          <li style="margin-bottom: 10px;">Find and add your contacts</li>
          <li style="margin-bottom: 10px;">Start a conversation</li>
          <li style="margin-bottom: 0;">Share photos, videos, and more</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${clientURL}" style="background: linear-gradient(to right, #36D1DC, #5B86E5); color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 500; display: inline-block;">Open Messenger</a>
      </div>
      
      <p style="margin-bottom: 5px;">If you need any help or have questions, we're always here to assist you.</p>
      <p style="margin-top: 0;">Happy messaging!</p>
      
      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The Messenger Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Messenger. All rights reserved.</p>
      <p>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}

export function createVerificationEmailTemplate(name, verificationURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Bitchat account</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
 
    <div style="background: #000000; padding: 30px; text-align: center; border-radius: 0;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; font-style: italic;">BITCHAT</h1>
    </div>
 
    <div style="background-color: #ffffff; padding: 40px; border: 2px solid #000; border-top: none;">
      <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin: 0 0 8px 0;">Verification Required</p>
      <h2 style="font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0 0 24px 0;">Confirm your email</h2>
 
      <p style="font-size: 14px; margin: 0 0 8px 0;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; margin: 0 0 28px 0;">
        You signed up for Bitchat. Click the button below to verify your email address and activate your account.
        This link expires in <strong>24 hours</strong>.
      </p>
 
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationURL}"
           style="display: inline-block; background: #000; color: #fff; text-decoration: none;
                  padding: 14px 36px; font-size: 13px; font-weight: 900; text-transform: uppercase;
                  letter-spacing: 3px; border: 2px solid #000;">
          [ VERIFY EMAIL ]
        </a>
      </div>
 
      <p style="font-size: 12px; color: #888; margin: 24px 0 0 0;">
        If the button doesn't work, paste this link into your browser:<br/>
        <a href="${verificationURL}" style="color: #000; word-break: break-all;">${verificationURL}</a>
      </p>
 
      <hr style="border: none; border-top: 2px solid #000; margin: 32px 0;" />
 
      <p style="font-size: 12px; color: #999; margin: 0;">
        Didn't sign up for Bitchat? You can safely ignore this email — your address won't be used.
      </p>
    </div>
 
    <div style="text-align: center; padding: 20px; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
      © 2026 Bitchat
    </div>
 
  </body>
  </html>
  `;
}