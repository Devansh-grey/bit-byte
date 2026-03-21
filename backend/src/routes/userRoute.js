import express from "express";
import { login, logout, signup, updateProfile } from "../controller/authcontroller.js";
import { loginValidation, registerValidation } from "../middleware/validator.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router()

router.post('/signup',registerValidation,signup)
router.post('/login',loginValidation,login)
router.post('/logout',logout)

router.put("/update-profile",authenticateUser,updateProfile)

router.get("/check",authenticateUser,(req,res) => res.status(200).json(req.user))

export default router