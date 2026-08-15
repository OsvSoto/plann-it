const PATRON_FECHA_VISUAL = /^(\d{2})-(\d{2})-(\d{4})$/
const PATRON_FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

function esFechaReal(anio: number, mes: number, dia: number) {
  const fecha = new Date(Date.UTC(anio, mes - 1, dia))

  return fecha.getUTCFullYear() === anio
    && fecha.getUTCMonth() === mes - 1
    && fecha.getUTCDate() === dia
}

export function fechaVisualAIso(fechaVisual: string): string | null {
  const coincidencia = PATRON_FECHA_VISUAL.exec(fechaVisual.trim())

  if (!coincidencia) {
    return null
  }

  const [, dia, mes, anio] = coincidencia

  if (!esFechaReal(Number(anio), Number(mes), Number(dia))) {
    return null
  }

  return `${anio}-${mes}-${dia}`
}

export function fechaIsoAVisual(fechaIso: string): string {
  const coincidencia = PATRON_FECHA_ISO.exec(fechaIso.trim())

  if (!coincidencia) {
    return ''
  }

  const [, anio, mes, dia] = coincidencia

  return esFechaReal(Number(anio), Number(mes), Number(dia))
    ? `${dia}-${mes}-${anio}`
    : ''
}

export function fechaVisualADate(fechaVisual: string): Date | null {
  const fechaIso = fechaVisualAIso(fechaVisual)

  if (!fechaIso) {
    return null
  }

  const [anio, mes, dia] = fechaIso.split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia))
}

export function fechaDateAVisual(fecha: Date): string {
  const dia = String(fecha.getUTCDate()).padStart(2, '0')
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0')
  const anio = fecha.getUTCFullYear()

  return `${dia}-${mes}-${anio}`
}

export function formatearEntradaFecha(valor: string): string {
  const digitos = valor.replace(/\D/g, '').slice(0, 8)

  if (digitos.length <= 2) {
    return digitos
  }

  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}-${digitos.slice(2)}`
  }

  return `${digitos.slice(0, 2)}-${digitos.slice(2, 4)}-${digitos.slice(4)}`
}
