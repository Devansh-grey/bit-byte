import { useState, useEffect, useRef } from "react"
import { useChatStore } from "../store/ChatStore"
import Avatar from "./Avatar"

const Contacts = ({ onChatStarted }) => {
    const [query, setQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [startingChat, setStartingChat] = useState(null)

    const { contacts, searchUsers, isSearching, accessChat } = useChatStore()

    const inputRef = useRef(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            searchUsers(query)
        }, 400)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        setSelectedIndex(0)
    }, [contacts])

    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex((prev) => Math.min(prev + 1, contacts.length - 1))
        }
        if (e.key === "ArrowUp") {
            setSelectedIndex((prev) => Math.max(prev - 1, 0))
        }
        if (e.key === "Enter") {
            const user = contacts[selectedIndex]
            if (user) handleStartChat(user)
        }
    }

    const handleStartChat = async (user) => {
        if (startingChat) return
        setStartingChat(user._id)
        try {
            await accessChat(user._id)
            onChatStarted?.()
        } catch (error) {
            console.error("Failed to start chat", error)
        } finally {
            setStartingChat(null)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">

            <div className="p-6 border-b-2 border-black bg-white">
                <div className="relative group">
                    <input
                        type="text"
                        ref={inputRef}
                        placeholder="SEARCH NAME OR EMAIL"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setSelectedIndex(0)
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-3 border-2 border-black font-mono text-sm outline-none placeholder:text-gray-400 transition-colors"
                    />
                    <div className="absolute inset-0 border-2 border-black translate-x-1 translate-y-1 -z-10 group-focus-within:translate-x-0 group-focus-within:translate-y-0 transition-transform bg-black" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y-2 divide-black border-b-2 border-black bg-gray-50">

                {isSearching && (
                    <p className="p-6 text-xs font-mono text-gray-500 animate-pulse">
                        {">"} SEARCHING...
                    </p>
                )}

                {!isSearching && !query && (
                    <p className="p-6 text-xs font-mono text-gray-400 text-center uppercase">
                        Search for a user to start a chat
                    </p>
                )}

                {contacts.map((user, index) => {
                    const isKeyboardSelected = index === selectedIndex
                    const isLoading = startingChat === user._id

                    return (
                        <div
                            key={user._id}
                            onClick={() => handleStartChat(user)}
                            className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all group
                                ${isKeyboardSelected
                                    ? "bg-black text-white"
                                    : "bg-white text-black hover:bg-black hover:text-white"}
                                ${isLoading ? "opacity-60 pointer-events-none" : ""}
                            `}
                        >
                            <div className={`shrink-0 border-2 transition-all ${
                                isKeyboardSelected ? "border-white" : "border-transparent group-hover:border-white"
                            }`}>
                                <Avatar name={user.fullName} src={user.profilePic} size={40} />
                            </div>

                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-bold font-mono truncate uppercase">
                                    {user.fullName}
                                </span>
                                <span className={`text-[10px] font-mono truncate ${
                                    isKeyboardSelected ? "text-gray-400" : "text-gray-500"
                                }`}>
                                    {user.email.toLowerCase()}
                                </span>
                            </div>

                            {isLoading && (
                                <span className="text-[10px] font-mono uppercase animate-pulse shrink-0">
                                    Opening...
                                </span>
                            )}
                        </div>
                    )
                })}

                {!isSearching && contacts.length === 0 && query && (
                    <div className="p-6">
                        <p className="text-xs font-mono text-gray-500 p-2 text-center uppercase">
                            No users found
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Contacts