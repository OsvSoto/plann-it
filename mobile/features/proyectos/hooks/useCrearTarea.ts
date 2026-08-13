import { useState } from 'react'

import { crearTarea as crearTareaService } from '../services/proyecto.service'

import type { EstadoTarea } from '../types'

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

export function useCrearTarea() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState<EstadoTarea>('PENDIENTE')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function limpiarError() {
    setError(null)
  }

  function reiniciar() {
    setNombre('')
    setDescripcion('')
    setEstado('PENDIENTE')
    setFechaEntrega('')
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
      await crearTareaService({
        listaId,
        nombre: nombreLimpio,
        descripcion: descripcionLimpia || null,
        estado,
        fechaEntrega: fechaLimpia,
      })
      reiniciar()
      return true
    } catch (error) {
      console.error('Error al crear tarea:', error)
      setError('No fue posible crear la tarea. Intenta nuevamente.')
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
