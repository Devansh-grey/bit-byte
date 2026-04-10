import * as Toast from "@radix-ui/react-toast"
import { createContext, useContext, useState } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "default") => {
    const id = Date.now()

    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, type === "loading" ? 100000 : 4000)
  }

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    loading: (msg) => addToast(msg, "loading"),
  }

  return (
    <ToastContext.Provider value={toast}>
      <Toast.Provider swipeDirection="right">

        {children}

        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            duration={4000}
            className={`px-4 py-3 rounded-md shadow-lg border
              ${toast.type === "success" && "bg-black text-white border-white"}
              ${toast.type === "error" && "bg-white text-black border-black"}
              ${toast.type === "loading" && "bg-black text-white border-dashed border-white"}
            `}
          >
            <Toast.Description className="text-sm">
              {toast.message}
            </Toast.Description>
          </Toast.Root>
        ))}

        <Toast.Viewport className="fixed top-4 right-4 flex flex-col gap-2 w-[320px] z-50" />

      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}