 export const formatTime = (date) => {
        const d = new Date(date)
        const now = new Date()
        const diff = now - d
        const day = 1000 * 60 * 60 * 24
        if (diff < day) {
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
        if (diff < day * 2) {
            return "Yesterday"
        }
        return d.toLocaleDateString()
    }
