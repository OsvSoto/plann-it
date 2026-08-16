import { useEffect, useState } from 'react'

import { editarProyecto } from '../services/proyecto.service'
import { fechaIsoAVisual, fechaVisualAIso } from '../utils/fecha'

import type { Proyecto, EstadoProyecto } from '../types'

type FormularioEditarProyecto = {
  nombre: string
  descripcion: string
  fechaFin: string
  estado: EstadoProyecto
}

const formularioInicial: FormularioEditarProyecto = {
  nombre: '',
  descripcion: '',
  fechaFin: '',
  estado: 'ACTIVO',
}

export function useEditarProyecto(
  proyecto: Proyecto | null
) {
  const [formulario, setFormulario] =
    useState<FormularioEditarProyecto>(
      formularioInicial
    )

  const [guardando, setGuardando] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    if (!proyecto) {
      setFormulario(formularioInicial)
      return
    }

    setFormulario({
      nombre: proyecto.proyecto_nombre,
      descripcion:
        proyecto.proyecto_descripcion ?? '',
      fechaFin: fechaIsoAVisual(
        proyecto.proyecto_fecha_fin
      ),
      estado: proyecto.proyecto_estado as EstadoProyecto,
    })

    setError(null)
  }, [proyecto])

  function actualizarCampo(
    campo: keyof FormularioEditarProyecto,
    valor: string
  ) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))

    if (error) {
      setError(null)
    }
  }

  async function guardarCambios(): Promise<boolean> {
    if (!proyecto) {
      setError(
        'No se encontró el proyecto a editar.'
      )
      return false
    }

    const nombre = formulario.nombre.trim()
    const descripcion = formulario.descripcion.trim()
    const fechaFinVisual = formulario.fechaFin.trim()
    const estado = formulario.estado.trim()

    // Validar nombre
    if (!nombre) {
      setError(
        'Ingresa un nombre para el proyecto.'
      )
      return false
    }

    // Validar fecha está presente
    if (!fechaFinVisual) {
      setError(
        'Ingresa la fecha de término del proyecto.'
      )
      return false
    }

    // Convertir fecha y validar que sea válida
    const fechaFin = fechaVisualAIso(fechaFinVisual)

    if (!fechaFin) {
      setError(
        'Usa una fecha válida con el formato DD-MM-AAAA.'
      )
      return false
    }

    // Validar que la fecha no sea pasada
    const ahora = new Date()
    const fechaFinDate = new Date(fechaFin)

    if (fechaFinDate <= ahora) {
      setError('La fecha de término debe ser futura.')
      return false
    }

    // Validar estado
    if (!estado) {
      setError(
        'Selecciona un estado para el proyecto.'
      )
      return false
    }

    try {
      setGuardando(true)
      setError(null)

      await editarProyecto({
        proyectoId: proyecto.proyecto_id,
        nombre,
        descripcion,
        fechaFin,
        estado: estado as EstadoProyecto,
      })

      return true
    } catch (error) {
      console.error(
        'Error al editar proyecto:',
        error
      )

      setError(
        'No fue posible actualizar el proyecto. Intenta nuevamente.'
      )

      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    formulario,
    guardando,
    error,
    actualizarCampo,
    guardarCambios,
  }
}
