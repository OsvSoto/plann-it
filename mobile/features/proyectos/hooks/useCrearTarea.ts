import { useEffect, useState } from 'react'

import {
  actualizarTarea,
  crearTarea as crearTareaService,
} from '../services/proyecto.service'
import {
  fechaIsoAVisual,
  fechaVisualAIso,
} from '../utils/fecha'

import type { EstadoTarea, Tarea } from '../types'

function valoresIniciales(tarea?: Tarea | null) {
  return {
    nombre: tarea?.tarea_nombre ?? '',
    descripcion: tarea?.tarea_desc ?? '',
    estado: (tarea?.tarea_estado as EstadoTarea | undefined) ?? 'PENDIENTE',
    fechaEntrega: tarea ? fechaIsoAVisual(tarea.tarea_fecha_entrega) : '',
  }
}

export function useFormularioTarea(tarea?: Tarea | null) {
  const iniciales = valoresIniciales(tarea)
  const [nombre, setNombre] = useState(iniciales.nombre)
  const [descripcion, setDescripcion] = useState(iniciales.descripcion)
  const [estado, setEstado] = useState<EstadoTarea>(iniciales.estado)
  const [fechaEntrega, setFechaEntrega] = useState(iniciales.fechaEntrega)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const valores = valoresIniciales(tarea)
    setNombre(valores.nombre)
    setDescripcion(valores.descripcion)
    setEstado(valores.estado)
    setFechaEntrega(valores.fechaEntrega)
    setError(null)
  }, [tarea])

  function limpiarError() {
    setError(null)
  }

  function reiniciar() {
    const valores = valoresIniciales(tarea)
    setNombre(valores.nombre)
    setDescripcion(valores.descripcion)
    setEstado(valores.estado)
    setFechaEntrega(valores.fechaEntrega)
    setError(null)
  }

  async function guardar(listaId: string, orden: number) {
    if (guardando) {
      return false
    }

    const nombreLimpio = nombre.trim()
    const fechaVisual = fechaEntrega.trim()
    const descripcionLimpia = descripcion.trim()

    if (!nombreLimpio) {
      setError('Ingresa un nombre para la tarea.')
      return false
    }

    const fechaIso = fechaVisualAIso(fechaVisual)

    if (!fechaIso) {
      setError('Ingresa una fecha válida con el formato DD-MM-AAAA.')
      return false
    }

    try {
      setGuardando(true)
      setError(null)
      const datos = {
        nombre: nombreLimpio,
        descripcion: descripcionLimpia || null,
        estado,
        fechaEntrega: fechaIso,
      }

      if (tarea) {
        await actualizarTarea({
          tareaId: tarea.tarea_id,
          ...datos,
        })
      } else {
        await crearTareaService({
          listaId,
          orden,
          ...datos,
        })
      }
      reiniciar()
      return true
    } catch (error) {
      console.error('Error al guardar tarea:', error)
      setError('No fue posible guardar la tarea. Intenta nuevamente.')
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    nombre,
    descripcion,
    estado,
    fechaEntrega,
    guardando,
    error,
    setNombre,
    setDescripcion,
    setEstado,
    setFechaEntrega,
    limpiarError,
    reiniciar,
    guardar,
  }
}
