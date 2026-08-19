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
    fechaInicio: tarea ? fechaIsoAVisual(tarea.tarea_fecha_inicio) : '',
    fechaEntrega: tarea ? fechaIsoAVisual(tarea.tarea_fecha_entrega) : '',
  }
}

export function useFormularioTarea(tarea?: Tarea | null) {
  const iniciales = valoresIniciales(tarea)
  const [nombre, setNombre] = useState(iniciales.nombre)
  const [descripcion, setDescripcion] = useState(iniciales.descripcion)
  const [estado, setEstado] = useState<EstadoTarea>(iniciales.estado)
  const [fechaInicio, setFechaInicio] = useState(iniciales.fechaInicio)
  const [fechaEntrega, setFechaEntrega] = useState(iniciales.fechaEntrega)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const valores = valoresIniciales(tarea)
    setNombre(valores.nombre)
    setDescripcion(valores.descripcion)
    setEstado(valores.estado)
    setFechaInicio(valores.fechaInicio)
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
    setFechaInicio(valores.fechaInicio)
    setFechaEntrega(valores.fechaEntrega)
    setError(null)
  }

  async function guardar(listaId: string, orden: number) {
    if (guardando) {
      return false
    }

    const nombreLimpio = nombre.trim()
    const fechaInicioVisual = fechaInicio.trim()
    const fechaEntregaVisual = fechaEntrega.trim()
    const descripcionLimpia = descripcion.trim()

    if (!nombreLimpio) {
      setError('Ingresa un nombre para la tarea.')
      return false
    }

    const fechaInicioIso = fechaVisualAIso(fechaInicioVisual)

    if (!fechaInicioIso) {
      setError('Ingresa una fecha de inicio válida con el formato DD-MM-AAAA.')
      return false
    }

    const fechaEntregaIso = fechaVisualAIso(fechaEntregaVisual)

    if (!fechaEntregaIso) {
      setError('Ingresa una fecha de entrega válida con el formato DD-MM-AAAA.')
      return false
    }

    if (fechaInicioIso > fechaEntregaIso) {
      setError('La fecha de inicio no puede ser posterior a la de entrega.')
      return false
    }

    try {
      setGuardando(true)
      setError(null)
      const datos = {
        nombre: nombreLimpio,
        descripcion: descripcionLimpia || null,
        estado,
        fechaInicio: fechaInicioIso,
        fechaEntrega: fechaEntregaIso,
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
    fechaInicio,
    fechaEntrega,
    guardando,
    error,
    setNombre,
    setDescripcion,
    setEstado,
    setFechaInicio,
    setFechaEntrega,
    limpiarError,
    reiniciar,
    guardar,
  }
}
