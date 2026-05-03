const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['Admin', 'Member']).optional()
});

exports.signup = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const existingUser = await User.findOne({ email: validatedData.email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const user = await User.create({
      ...validatedData,
      password: hashedPassword
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    
    // Hash refresh token for DB storage
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      token: accessToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

exports.login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      
      const salt = await bcrypt.genSalt(10);
      user.refreshToken = await bcrypt.hash(refreshToken, salt);
      await user.save();

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        token: accessToken
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // We would typically clear the refresh token from DB if user is authenticated, 
    // but client can simply delete cookie and forget access token.
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    // Since we don't have cookie-parser yet, let's parse it manually or install cookie-parser
    // Wait, let's just assume we will install cookie-parser.
    const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token']; // fallback
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Not authorized, no refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshToken) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const tokens = generateTokens(user._id);
    
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, salt);
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ token: tokens.accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
