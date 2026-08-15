import { useEffect, useState } from 'react'

import {
  actualizarTarea,
  crearTarea as crearTareaService,
} from '../services/proyecto.service'

import type { EstadoTarea, Tarea } from '../types'

function esFechaValida(fecha: string) {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha)

  if (!coincidencia) {
    return false
  }

  const [, anio, mes, dia] = coincidencia
  const fechaUtc = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)))

  return (
    fechaUtc.getUTCFullYear() === Number(anio) &&
    fechaUtc.getUTCMonth() === Number(mes) - 1 &&
    fechaUtc.getUTCDate() === Number(dia)
  )
}

function valoresIniciales(tarea?: Tarea | null) {
  return {
    nombre: tarea?.tarea_nombre ?? '',
    descripcion: tarea?.tarea_desc ?? '',
    estado: (tarea?.tarea_estado as EstadoTarea | undefined) ?? 'PENDIENTE',
    fechaEntrega: tarea?.tarea_fecha_entrega ?? '',
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

  async function guardar(listaId: string) {
    if (guardando) {
      return false
    }

    const nombreLimpio = nombre.trim()
    const fechaLimpia = fechaEntrega.trim()
    const descripcionLimpia = descripcion.trim()

    if (!nombreLimpio) {
      setError('Ingresa un nombre para la tarea.')
      return false
    }

    if (!esFechaValida(fechaLimpia)) {
      setError('Ingresa una fecha válida con el formato AAAA-MM-DD.')
      return false
    }

    try {
      setGuardando(true)
      setError(null)
      const datos = {
        nombre: nombreLimpio,
        descripcion: descripcionLimpia || null,
        estado,
        fechaEntrega: fechaLimpia,
      }

      if (tarea) {
        await actualizarTarea({
          tareaId: tarea.tarea_id,
          ...datos,
        })
      } else {
        await crearTareaService({
          listaId,
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
