import express from 'express'
import { accessChat, deleteChat, getChatById, getChats } from '../controller/chatController.js'
import { authenticateUser } from '../middleware/auth.js'
import arcjetProtection from '../middleware/arcjet.middleware.js'

const router = express.Router()

router.use( arcjetProtection)
router.use(authenticateUser)

router.post("/", accessChat)
router.get("/", getChats)
router.get("/:chatId",getChatById)
router.delete("/:chatId",deleteChat)


export default router