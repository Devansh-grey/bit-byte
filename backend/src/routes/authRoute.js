import express from "express";
import {
    checkAuth,
    login,
    logout,
    signup,
    verifyEmail,
    resendVerification
} from "../controller/authcontroller.js";
import { loginValidation, registerValidation } from "../middleware/validator.js";
import { authenticateUser } from "../middleware/auth.js";
import arcjetProtection from "../middleware/arcjet.middleware.js";

const router = express.Router()

router.use(arcjetProtection)

router.post('/signup', registerValidation, signup)
router.post('/login', loginValidation, login)
router.post('/logout', logout)
router.get('/check', authenticateUser, checkAuth)


router.get('/verify-email', verifyEmail)

router.post('/resend-verification', resendVerification)

export default router