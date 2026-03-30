import express from 'express'
import { authenticateUser } from '../middleware/auth.js'
import { deleteMessage, getMessages, sendMessage, markAsSeen} from '../controller/messageController.js'
import arcjetProtection from '../middleware/arcjet.middleware.js'

const router = express.Router()

router.use(arcjetProtection,authenticateUser)

router.post("/",sendMessage)
router.get("/:chatId", getMessages)
router.put("/:messageId/seen", markAsSeen)
router.delete("/:messageId", deleteMessage)

export default router