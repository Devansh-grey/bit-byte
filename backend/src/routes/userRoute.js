import express from 'express'
import { getUserProfile, searchUsers, updateProfile } from '../controller/userController.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticateUser)

router.get("/search",searchUsers)
router.put("/profile", updateProfile)
router.get("/:id",getUserProfile)

export default router