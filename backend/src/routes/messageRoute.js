import express from 'express'
import { authenticateUser } from '../middleware/auth.js'
import { deleteMessage, getMessages, sendMessage, markAsSeen} from '../controller/messageController.js'

const router = express.Router()

router.use(authenticateUser)

router.post("/",sendMessage)
router.get("/:chatId", getMessages)
router.put("/:messageId/seen", markAsSeen)
router.delete("/:messageId", deleteMessage)

export default router