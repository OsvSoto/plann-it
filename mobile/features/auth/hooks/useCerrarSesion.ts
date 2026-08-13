import { useState } from 'react'

import { cerrarSesion as cerrarSesionService } from '../services/auth.service'

export function useCerrarSesion() {
  const [cerrandoSesion, setCerrandoSesion] = useState(false)

  async function cerrarSesion() {
    try {
      setCerrandoSesion(true)
      await cerrarSesionService()
    } finally {
      setCerrandoSesion(false)
    }
  }

  return {
    cerrandoSesion,
    cerrarSesion,
  }
}
