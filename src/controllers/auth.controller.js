import { registerUser, loginUser, getUserProfile } from '../services/auth/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  return res.status(201).json({
    success: true,
    data: result
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  return res.status(200).json({
    success: true,
    data: result
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  return res.status(200).json({
    success: true,
    data: user
  });
});

export const logout = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
});
