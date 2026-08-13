import { useState } from 'react'

import {
  eliminarLista as eliminarListaService,
  eliminarProyecto as eliminarProyectoService,
  eliminarTarea as eliminarTareaService,
} from '../services/proyecto.service'

type TipoRecurso = 'lista' | 'proyecto' | 'tarea'

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

  return {
    eliminando,
    eliminarTarea,
    eliminarLista,
    eliminarProyecto,
  }
}
