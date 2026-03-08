'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

interface ToastContextType {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<{ id: number; text: string }[]>([])
  let nextId = 0

  const showToast = useCallback((message: string) => {
    const id = nextId++
    setMessages((prev) => [...prev, { id, text: message }])
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 pointer-events-none">
        {messages.map((m) => (
          <div
            key={m.id}
            className="bg-[#181d22] border border-[#1f2a32] rounded-lg px-4 py-2.5 text-sm text-white
              shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {m.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
