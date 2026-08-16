import { useState } from 'react'

import {
  eliminarLista as eliminarListaService,
  eliminarProyecto as eliminarProyectoService,
  eliminarTablero as eliminarTableroService,
  eliminarTarea as eliminarTareaService,
} from '../services/proyecto.service'

type TipoRecurso = 'lista' | 'proyecto' | 'tablero' | 'tarea'

export function useEliminarRecursosProyecto() {
  const [eliminando, setEliminando] = useState<string | null>(null)

  async function ejecutar(
    tipo: TipoRecurso,
    id: string,
    accion: (recursoId: string) => Promise<void>
  ) {
    if (eliminando) {
      return false
    }

    try {
      setEliminando(id)
      await accion(id)
      return true
    } catch (error) {
      console.error(`Error al eliminar ${tipo}:`, error)
      return false
    } finally {
      setEliminando(null)
    }
  }

  function eliminarTarea(tareaId: string) {
    return ejecutar('tarea', tareaId, eliminarTareaService)
  }

  function eliminarLista(listaId: string) {
    return ejecutar('lista', listaId, eliminarListaService)
  }

  function eliminarProyecto(proyectoId: string) {
    return ejecutar('proyecto', proyectoId, eliminarProyectoService)
  }

  function eliminarTablero(tableroId: string) {
    return ejecutar('tablero', tableroId, eliminarTableroService)
  }

  return {
    eliminando,
    eliminarTarea,
    eliminarLista,
    eliminarProyecto,
    eliminarTablero,
  }
}
