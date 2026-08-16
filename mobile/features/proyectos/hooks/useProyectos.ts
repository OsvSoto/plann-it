import { useCallback, useState } from 'react'

import {
  crearProyecto,
  obtenerProyectos,
} from '../services/proyecto.service'

import type {
  CrearProyectoInput,
  Proyecto,
} from '../types'

export function useProyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarProyectos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const proyectosObtenidos =
        await obtenerProyectos()

      setProyectos(proyectosObtenidos)
    } catch (error) {
      console.error(error)
      setError('No fue posible cargar los proyectos')
    } finally {
      setCargando(false)
    }
  }, [])

  async function agregarProyecto(
    proyecto: CrearProyectoInput
  ) {
    await crearProyecto(proyecto)
    await cargarProyectos()
  }

  return {
    proyectos,
    cargando,
    error,
    cargarProyectos,
    agregarProyecto,
  }
}
