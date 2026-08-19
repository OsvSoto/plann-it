import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { supabase } from '../../../lib/supabase'
import { marcarChatLeido, obtenerNoLeidosChat } from '../services/chat.service'

type ChatContextType = {
  chatAbierto: boolean
  setChatAbierto: (abierto: boolean) => void
  proyectosNoLeidos: Set<string>
  hayNoLeidos: boolean
  marcarProyectoLeido: (proyectoId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatAbierto, setChatAbierto] = useState(false)
  const [proyectosNoLeidos, setProyectosNoLeidos] = useState<Set<string>>(new Set())
  const [miId, setMiId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setMiId(data.user.id)
    })
  }, [])

  useEffect(() => {
    obtenerNoLeidosChat()
      .then((proyectoIds) => setProyectosNoLeidos(new Set(proyectoIds)))
      .catch((error) => console.error('Error al obtener chats no leidos:', error))
  }, [])

  useEffect(() => {
    if (!miId) return

    const channel = supabase
      .channel('mensaje_no_leidos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensaje' },
        (payload) => {
          const proyectoId = payload.new.mensaje_proyecto_id as string
          const autorId = payload.new.mensaje_usuario_id as string | null
          if (autorId === miId) return

          setProyectosNoLeidos((previo) => {
            const siguiente = new Set(previo)
            siguiente.add(proyectoId)
            return siguiente
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [miId])

  const marcarProyectoLeido = useCallback((proyectoId: string) => {
    setProyectosNoLeidos((previo) => {
      if (!previo.has(proyectoId)) return previo
      const siguiente = new Set(previo)
      siguiente.delete(proyectoId)
      return siguiente
    })

    marcarChatLeido(proyectoId).catch((error) =>
      console.error('Error al marcar chat como leido:', error)
    )
  }, [])

  return (
    <ChatContext.Provider
      value={{
        chatAbierto,
        setChatAbierto,
        proyectosNoLeidos,
        hayNoLeidos: proyectosNoLeidos.size > 0,
        marcarProyectoLeido,
      }}
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
