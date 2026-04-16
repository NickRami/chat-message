import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user.model';
import { Session } from '../../models/session.model';
import { env } from '../../config/env';

export const registerUser = async (email: string, passwordRaw: string, name: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  const password = await bcrypt.hash(passwordRaw, 10);
  const user = await User.create({ email, password, name });
  
  const tokens = await generateTokens(user._id.toString());
  return { user: { id: user._id, email: user.email, name: user.name }, ...tokens };
};

export const loginUser = async (email: string, passwordRaw: string) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(passwordRaw, user.password!))) {
    throw new Error('Invalid credentials');
  }

  const tokens = await generateTokens(user._id.toString());
  return { user: { id: user._id, email: user.email, name: user.name }, ...tokens };
};

const generateTokens = async (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
  const refreshTokenRaw = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await Session.create({
    userId,
    token: refreshTokenRaw,
    expiresAt,
  });

  return { accessToken, refreshToken: refreshTokenRaw };
};

export const refreshTokens = async (oldRefreshToken: string) => {
  const session = await Session.findOne({ token: oldRefreshToken, revoked: false });
  if (!session || session.expiresAt < new Date()) {
    if (session) await Session.updateOne({ _id: session._id }, { revoked: true });
    throw new Error('Invalid session');
  }

  const decoded = jwt.verify(oldRefreshToken, env.JWT_REFRESH_SECRET) as { id: string };
  const { accessToken, refreshToken } = await generateTokens(decoded.id);

  // Revoke old token
  await Session.updateOne({ _id: session._id }, { revoked: true });

  return { accessToken, newRefreshToken: refreshToken };
};

export const revokeSession = async (refreshToken: string) => {
  await Session.updateOne({ token: refreshToken }, { revoked: true });
};

export const getUserById = async (id: string) => {
  return User.findById(id).select('-password');
};
