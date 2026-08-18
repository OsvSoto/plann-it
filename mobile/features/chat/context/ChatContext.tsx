import React, { createContext, useContext, useState } from 'react'

type ChatContextType = {
  chatAbierto: boolean
  setChatAbierto: (abierto: boolean) => void
  proyectoActivoId: string | null
  setProyectoActivoId: (proyectoId: string | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatAbierto, setChatAbierto] = useState(false)
  const [proyectoActivoId, setProyectoActivoId] = useState<string | null>(null)

  return (
    <ChatContext.Provider
      value={{ chatAbierto, setChatAbierto, proyectoActivoId, setProyectoActivoId }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChatGlobal() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatGlobal debe usarse dentro de un ChatProvider')
  }
  return context
}