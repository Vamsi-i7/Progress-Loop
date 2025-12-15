import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const generateToken = (user: any) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
        { expiresIn: '30d' }
    );
};

// -- Email Service (Nodemailer) --
// Ensure you have these in your .env
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=587
// SMTP_USER=your_email@gmail.com
// SMTP_PASS=your_app_password

const sendVerificationEmail = async (email: string, token: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or use host/port from env
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const port = process.env.PORT || 5001;
        // Frontend likely on 3000 or 3001. We should ideally config this. 
        // For now assume frontend is on 3001 if header not present, or use fixed.
        // Actually, let's just log the link with the default frontend port since we don't know it easily here.
        const verificationLink = `http://localhost:3001/#/verify/${token}`;

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("---------------------------------------------------");
            console.log("⚠️ SMTP Credentials missing. Email NOT sent.");
            console.log(`🔗 Verification Link (DEV ONLY): ${verificationLink}`);
            console.log("---------------------------------------------------");
            return;
        }

        await transporter.sendMail({
            from: '"Progress Loop" <no-reply@progressloop.com>',
            to: email,
            subject: 'Verify your ID - Progress Loop',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Welcome to Progress Loop!</h2>
                    <p>Please verify your email address to unlock your dashboard.</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">If you didn't create an account, you can ignore this email.</p>
                </div>
            `
        });
        console.log(`Verification email sent to ${email}`);

    } catch (error) {
        console.error("Email sending failed:", error);
        // Fallback for Dev/Error cases:
        const verificationLink = `http://localhost:3000/#/verify/${token}`; // Adjust port if needed, hardcoded fallback
        console.log("---------------------------------------------------");
        console.log("⚠️ Email failed. Verification Link (FALLBACK):");
        console.log(verificationLink);
        console.log("---------------------------------------------------");
    }
};

export const register = async (req: Request, res: Response) => {
    const { username, email, password, name } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            // Explicit error message
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        // Also check username uniqueness if needed
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            res.status(400).json({ message: 'Username is taken' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const verificationToken = uuidv4();

        user = new User({
            username,
            email,
            passwordHash,
            name,
            joinedDate: new Date(),
            lastActiveDate: new Date(),
            isVerified: false,
            verificationToken
        });

        await user.save();

        // Send Email
        await sendVerificationEmail(email, verificationToken);

        // Do NOT send token back. Force them to check email.
        res.json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.'
        });

    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body; // or req.params if GET

    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        const authToken = generateToken(user);
        res.json({ token: authToken, user });

    } catch (err: any) {
        console.log(err);
        res.status(500).json({ message: 'Server error during verification' });
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid Credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid Credentials' });
            return;
        }

        if (!user.isVerified) {
            res.status(403).json({ message: 'Please verify your email address first.' });
            return;
        }

        const token = generateToken(user);
        res.json({ token, user });

    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-passwordHash');
        res.json(user);
    } catch (err: any) {
        res.status(500).send('Server Error');
    }
};
