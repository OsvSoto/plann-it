import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { obtenerMiembrosProyecto } from '../../invitaciones/services/invitacion.service'
import type { MiembroProyecto } from '../../invitaciones/types'
import { obtenerAsignacionesProyecto } from '../../proyectos/services/asignacion.service'
import type { EstadoTarea } from '../../proyectos/types'
import { fechaIsoAVisual, fechaVisualAIso } from '../../proyectos/utils/fecha'
import { actualizarTareaAsignacionGantt, fetchGanttData } from '../services/ganttService'

export function useEditarTareaGantt(tareaId: string | undefined, proyectoId: string | undefined) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [estado, setEstado] = useState<EstadoTarea>('PENDIENTE')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [miembros, setMiembros] = useState<MiembroProyecto[]>([])
  const [miembroSeleccionado, setMiembroSeleccionado] = useState<string | null>(null)
  const [miembroOriginal, setMiembroOriginal] = useState<string | null>(null)
  const [asignacionIdActual, setAsignacionIdActual] = useState<string | null>(null)

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargarDatos() {
      if (!tareaId || !proyectoId) return
      try {
        setCargando(true)
        setError(null)

        // Usamos los RPC para evadir los bloqueos de RLS directos
        const [miembrosProyecto, asignacionesProyecto, ganttData, tareaRes] = await Promise.all([
          obtenerMiembrosProyecto(proyectoId),
          obtenerAsignacionesProyecto(proyectoId),
          fetchGanttData(proyectoId),
          supabase.from('tarea').select('*').eq('tarea_id', tareaId).single()
        ])

        if (tareaRes.error) throw tareaRes.error
        const tarea = tareaRes.data

        setMiembros(miembrosProyecto)
        setNombre(tarea.tarea_nombre)
        setDescripcion(tarea.tarea_desc ?? '')
        setEstado(tarea.tarea_estado as EstadoTarea)

        const asignacion = asignacionesProyecto.find(a => a.tarea_id === tareaId)
        const tareaGantt = ganttData.find(t => t.id_tarea === tareaId)

        if (asignacion) {
          setAsignacionIdActual(asignacion.asignacion_id)
          setMiembroSeleccionado(asignacion.miembro_proyecto_id)
          setMiembroOriginal(asignacion.miembro_proyecto_id)
        } else {
          setAsignacionIdActual(null)
          setMiembroSeleccionado(null)
          setMiembroOriginal(null)
        }

        const parseDate = (d: string | null | undefined) => d ? d.split('T')[0] : null;
        
        if (tareaGantt) {
          setFechaInicio(fechaIsoAVisual(parseDate(tareaGantt.fecha_inicio) || tarea.tarea_fecha_entrega))
          setFechaFin(fechaIsoAVisual(parseDate(tareaGantt.fecha_fin) || tarea.tarea_fecha_entrega))
        } else {
          setFechaInicio(fechaIsoAVisual(tarea.tarea_fecha_entrega))
          setFechaFin(fechaIsoAVisual(tarea.tarea_fecha_entrega))
        }

      } catch (err: any) {
        console.error('Error al cargar datos para Gantt:', err)
        setError('No pudimos cargar la informaci n de la tarea.')
      } finally {
        setCargando(false)
      }
    }
    void cargarDatos()
  }, [tareaId, proyectoId])

  function limpiarError() {
    setError(null)
  }

  async function guardar() {
    if (guardando || !tareaId) return false

    const nombreLimpio = nombre.trim()
    const descLimpia = descripcion.trim() || null
    
    if (!nombreLimpio) {
      setError('El nombre de la tarea es obligatorio.')
      return false
    }

    const isoInicio = fechaVisualAIso(fechaInicio)
    const isoFin = fechaVisualAIso(fechaFin)

    if (!isoInicio || !isoFin) {
      setError('Las fechas deben tener un formato v lido (DD-MM-AAAA).')
      return false
    }

    const dateInicio = new Date(`${isoInicio}T00:00:00`)
    const dateFin = new Date(`${isoFin}T00:00:00`)

    if (dateInicio > dateFin) {
      setError('La fecha de inicio no puede ser posterior a la fecha de t rmino.')
      return false
    }

    try {
      setGuardando(true)
      setError(null)
      await actualizarTareaAsignacionGantt(tareaId, {
        nombre: nombreLimpio,
        descripcion: descLimpia,
        estado,
        fechaInicio: isoInicio,
        fechaFin: isoFin,
        miembroId: miembroSeleccionado,
        miembroIdAnterior: miembroOriginal,
        asignacionId: asignacionIdActual
      })
      return true
    } catch (err: any) {
      console.error('Error guardando tarea desde Gantt:', err)
      setError(err.message || 'No fue posible guardar los cambios. Intenta nuevamente.')
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
    fechaFin,
    miembros,
    miembroSeleccionado,
    cargando,
    guardando,
    error,
    setNombre,
    setDescripcion,
    setEstado,
    setFechaInicio,
    setFechaFin,
    setMiembroSeleccionado,
    limpiarError,
    guardar
  }
}