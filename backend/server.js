'use strict';

require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const nodemailer  = require('nodemailer');
const path        = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ================================================================
   SECURITY MIDDLEWARE
================================================================ */
app.use(helmet());

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10kb' }));

/* ================================================================
   STATIC FILES (serve the portfolio from parent directory)
================================================================ */
app.use(express.static(path.join(__dirname, '..')));

/* ================================================================
   RATE LIMITING FOR CONTACT ENDPOINT
================================================================ */
const contactLimiter = rateLimit({
    windowMs:  15 * 60 * 1000,  // 15 minutes
    max:       5,                // max 5 requests per window per IP
    standardHeaders: true,
    legacyHeaders:   false,
    message: {
        success: false,
        error: 'Too many requests. Please wait 15 minutes before trying again.'
    }
});

/* ================================================================
   NODEMAILER TRANSPORTER
================================================================ */
function createTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }
    return nodemailer.createTransport({
        host:   process.env.SMTP_HOST || 'smtp.gmail.com',
        port:   parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

/* ================================================================
   EMAIL VALIDATION
================================================================ */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateContactPayload(body) {
    const errors = [];

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
        errors.push('Name is required and must be at least 2 characters.');
    }

    if (!body.email || !EMAIL_REGEX.test(body.email.trim())) {
        errors.push('A valid email address is required.');
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length < 5) {
        errors.push('Message is required and must be at least 5 characters.');
    }

    if (body.name    && body.name.trim().length    > 200) errors.push('Name is too long.');
    if (body.email   && body.email.trim().length   > 254) errors.push('Email is too long.');
    if (body.subject && body.subject.trim().length > 300) errors.push('Subject is too long.');
    if (body.message && body.message.trim().length > 5000) errors.push('Message must be under 5000 characters.');

    return errors;
}

/* ================================================================
   POST /api/contact
================================================================ */
app.post('/api/contact', contactLimiter, async (req, res) => {
    const validationErrors = validateContactPayload(req.body);
    if (validationErrors.length) {
        return res.status(400).json({ success: false, errors: validationErrors });
    }

    const { name, email, subject, message } = req.body;
    const safeName    = name.trim();
    const safeEmail   = email.trim();
    const safeSubject = subject ? subject.trim() : `Portfolio Contact from ${safeName}`;
    const safeMessage = message.trim();

    const contactEmail = process.env.CONTACT_EMAIL || 'pablomorillacabello@gmail.com';
    const transporter  = createTransporter();

    if (!transporter) {
        // Dev mode: log to console when SMTP is not configured
        console.log('\n====== NEW CONTACT MESSAGE (dev mode) ======');
        console.log('From:    ', safeName, '<' + safeEmail + '>');
        console.log('Subject: ', safeSubject);
        console.log('Message:\n', safeMessage);
        console.log('============================================\n');
        return res.json({ success: true, message: 'Message received (logged in dev mode).' });
    }

    const mailOptions = {
        from:     `"Portfolio Contact" <${process.env.SMTP_USER}>`,
        to:       contactEmail,
        replyTo:  `"${safeName}" <${safeEmail}>`,
        subject:  safeSubject,
        text:     `New contact form submission\n\nName: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessage}`,
        html: `
            <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;">
                <h2 style="color:#B8956A;border-bottom:2px solid #E8D5B7;padding-bottom:0.5rem;">
                    New Portfolio Contact
                </h2>
                <table style="width:100%;border-collapse:collapse;margin-bottom:1rem;">
                    <tr>
                        <td style="padding:0.5rem 1rem 0.5rem 0;font-weight:600;color:#6B5D52;width:80px;">Name</td>
                        <td style="padding:0.5rem 0;">${safeName}</td>
                    </tr>
                    <tr>
                        <td style="padding:0.5rem 1rem 0.5rem 0;font-weight:600;color:#6B5D52;">Email</td>
                        <td style="padding:0.5rem 0;"><a href="mailto:${safeEmail}" style="color:#B8956A;">${safeEmail}</a></td>
                    </tr>
                    <tr>
                        <td style="padding:0.5rem 1rem 0.5rem 0;font-weight:600;color:#6B5D52;">Subject</td>
                        <td style="padding:0.5rem 0;">${safeSubject}</td>
                    </tr>
                </table>
                <div style="background:#F5F1EA;padding:1rem;border-left:4px solid #B8956A;border-radius:4px;">
                    <p style="white-space:pre-wrap;margin:0;">${safeMessage.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
                </div>
                <p style="font-size:0.8rem;color:#999;margin-top:1.5rem;">
                    Sent via pablomorillacabello.github.io contact form
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[contact] Email sent from ${safeEmail}`);
        return res.json({ success: true, message: 'Your message has been sent successfully!' });
    } catch (err) {
        console.error('[contact] Email send failed:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to send email. Please try again later.' });
    }
});

/* ================================================================
   HEALTH CHECK
================================================================ */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ================================================================
   FALLBACK – serve index.html for any unmatched route
================================================================ */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

/* ================================================================
   ERROR HANDLING MIDDLEWARE
================================================================ */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('[error]', err.stack || err.message);
    res.status(500).json({ success: false, error: 'Internal server error.' });
});

/* ================================================================
   START
================================================================ */
app.listen(PORT, () => {
    console.log(`Pablo portfolio backend running on http://localhost:${PORT}`);
    console.log(`SMTP configured: ${!!(process.env.SMTP_USER && process.env.SMTP_PASS)}`);
    console.log(`Contact email  : ${process.env.CONTACT_EMAIL || 'pablomorillacabello@gmail.com (default)'}`);
});
