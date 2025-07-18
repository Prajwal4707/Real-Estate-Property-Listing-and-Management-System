import express from 'express';
import { login, register, verifyOTP, resendOTP, forgotpassword, adminlogin, resetpassword, getname } from '../controller/Usercontroller.js';
import authMiddleware from '../middleware/authmiddleware.js';


const userrouter = express.Router();

userrouter.post('/login', login);
userrouter.post('/register', register);
userrouter.post('/verify-otp', verifyOTP);
userrouter.post('/resend-otp', resendOTP);
userrouter.post('/forgot', forgotpassword);
userrouter.post('/reset/:token', resetpassword);
userrouter.post('/admin', adminlogin);
userrouter.get('/me', authMiddleware, getname);

export default userrouter;