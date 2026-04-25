import React from 'react'
import Sidebar from '../components/Sidebar'
import MessageArea from '../components/MessageArea'
import { useChatStore } from '../store/ChatStore'

const ChatPage = () => {
  const { selectedChat } = useChatStore()

  console.log("[ChatPage] selectedChat:", selectedChat?._id ?? "NULL")

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 relative bg-white overflow-hidden">
        {selectedChat
          ? <MessageArea />
          : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="font-headline font-black text-2xl uppercase tracking-tighter text-gray-300">
                  SELECT A CHAT
                </p>
                <p className="font-mono text-xs text-gray-300 mt-2 uppercase">
                  or start a new one from contacts
                </p>
              </div>
            </div>
          )
        }
      </main>
    </div>
  )
}

export default ChatPage