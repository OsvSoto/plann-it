import { useState } from 'react'

import { crearProyecto } from '../services/proyecto.service'

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
    const fechaFin = formulario.fechaFin.trim()

    if (!nombre) {
      setError('Ingresa un nombre para el proyecto.')
      return false
    }

    if (!fechaFin) {
      setError('Ingresa la fecha de término del proyecto.')
      return false
    }

    if (!esFechaValida(fechaFin)) {
      setError('Usa una fecha válida con el formato AAAA-MM-DD.')
      return false
    }

    try {
      setGuardando(true)
      setError(null)

      await crearProyecto({
        nombre,
        descripcion: descripcion || null,
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
