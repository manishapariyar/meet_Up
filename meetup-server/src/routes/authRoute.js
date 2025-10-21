import express from 'express';
import { login, signup, refreshToken, logout } from '../controllers/auth/authControllers.js';
import { loginValidation, refreshTokenValidation, signupValidation } from '../middlewares/auth/authValidation.js';
const router = express.Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.post('/refresh-token', refreshTokenValidation, refreshToken);
router.post('/logout', logout);
export default router;