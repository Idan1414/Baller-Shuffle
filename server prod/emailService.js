import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});
export function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function sendVerificationEmail(to, code) {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'BallerShuffle - Email Verification',
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BallerShuffle Verification</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                line-height: 1.6;
            }
            .email-container {
                background-color: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 90%;
                overflow: hidden;
                transform: translateY(-20px);
                transition: all 0.3s ease;
            }
            .email-header {
                background: linear-gradient(135deg, #FFC764, #E4A32D);
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-content {
                padding: 30px;
                text-align: center;
            }
            .verification-code {
                background: rgba(230, 201, 127, 0.1);
                border: 2px dashed rgba(230, 201, 127, 0.5);
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                display: inline-block;
            }
            .verification-code h1 {
                color: #E4A32D;
                letter-spacing: 8px;
                margin: 0;
                font-size: 32px;
                font-weight: 600;
            }
            .email-footer {
                background: linear-gradient(135deg, #FFC764, #E4A32D);
                color: white;
                text-align: center;
                padding: 15px;
                font-size: 0.8em;
            }
            .subtle-text {
                color: #8E8E93;
                font-size: 14px;
            }
            .main-text {
                color: #1C1C1E;
                font-weight: 400;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1 style="margin: 0; font-weight: 300;">🏀 BallerShuffle ⚽</h1>
            </div>
            <div class="email-content">
                <p class="subtle-text">Your Verification Code:</p>
                <div class="verification-code">
                    <h1>${code}</h1>
                </div>
                <p class="main-text">Thank you for signing up! To complete your registration, please enter the verification code above.</p>
                <p class="subtle-text">This code will expire in 3 minutes.</p>
                <p class="subtle-text" style="margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="email-footer">
                <p style="margin: 0;">&copy; 2025 BallerShuffle. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
          `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};



export async function sendPasswordVerificationEmail(to, resetCode) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'BallerShuffle - Password Reset Request',
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BallerShuffle Password Reset</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                line-height: 1.6;
            }
            .email-container {
                background-color: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 90%;
                margin: 20px auto;
                overflow: hidden;
            }
            .email-header {
                background: linear-gradient(135deg, #FFC764, #E4A32D);
                color: white;
                text-align: center;
                padding: 20px;
            }
            .email-content {
                padding: 30px;
                text-align: center;
            }
            .reset-code {
                background: rgba(230, 201, 127, 0.1);
                border: 2px dashed rgba(230, 201, 127, 0.5);
                border-radius: 12px;
                padding: 25px;
                margin: 25px 0;
                display: inline-block;
            }
            .reset-code h1 {
                color: #E4A32D;
                letter-spacing: 8px;
                margin: 0;
                font-size: 32px;
                font-weight: 600;
            }
            .email-footer {
                background: linear-gradient(135deg, #FFC764, #E4A32D);
                color: white;
                text-align: center;
                padding: 15px;
                font-size: 0.8em;
            }
            .subtle-text {
                color: #8E8E93;
                font-size: 14px;
            }
            .main-text {
                color: #1C1C1E;
                font-weight: 400;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1 style="margin: 0; font-weight: 300;">🏀 BallerShuffle ⚽</h1>
            </div>
            <div class="email-content">
                <p class="subtle-text">Your Password Reset Code:</p>
                <div class="reset-code">
                    <h1>${resetCode}</h1>
                </div>
                <p class="main-text">A password reset has been requested for your account. Please use the code above to reset your password.</p>
                <p class="subtle-text">This code will expire in 3 minutes.</p>
                <p class="subtle-text" style="margin-top: 20px;">If you didn't request this code, please ignore this email and ensure your account is secure.</p>
            </div>
            <div class="email-footer">
                <p style="margin: 0;">&copy; 2025 BallerShuffle. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};


export default {
    generateVerificationCode,
    sendVerificationEmail,
    sendPasswordVerificationEmail
};