import { useState } from 'react'

import { crearProyecto } from '../services/proyecto.service'
import { fechaVisualAIso } from '../utils/fecha'

type FormularioProyecto = {
  nombre: string
  descripcion: string
  fechaFin: string
}

const formularioInicial: FormularioProyecto = {
  nombre: '',
  descripcion: '',
  fechaFin: '',
}

export function useCrearProyecto() {
  const [formulario, setFormulario] = useState(formularioInicial)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function actualizarCampo(campo: keyof FormularioProyecto, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))

    if (error) {
      setError(null)
    }
  }

  async function guardarProyecto() {
    const nombre = formulario.nombre.trim()
    const descripcion = formulario.descripcion.trim()
    const fechaFinVisual = formulario.fechaFin.trim()

    if (!nombre) {
      setError('Ingresa un nombre para el proyecto.')
      return false
    }

    if (!fechaFinVisual) {
      setError('Ingresa la fecha de término del proyecto.')
      return false
    }

    const fechaFin = fechaVisualAIso(fechaFinVisual)

    if (!fechaFin) {
      setError('Usa una fecha válida con el formato DD-MM-AAAA.')
      return false
    }

    try {
      setGuardando(true)
      setError(null)

      await crearProyecto({
        nombre,
        descripcion,
        fechaFin,
      })

      return true
    } catch (error) {
      console.error('Error al crear proyecto:', error)
      setError('No fue posible crear el proyecto. Intenta nuevamente.')
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
    guardarProyecto,
  }
}
