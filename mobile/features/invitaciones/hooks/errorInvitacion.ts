export function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string
) {
  if (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof error.message === 'string'
  ) {
    return error.message
  }

  return mensajePredeterminado
}
