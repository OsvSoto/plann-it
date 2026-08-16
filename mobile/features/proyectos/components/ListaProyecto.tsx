import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import DraggableFlatList, {
  type RenderItemParams,
} from 'react-native-draggable-flatlist'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import { TareaModal } from './CrearTareaModal'
import { AsignarMiembrosModal } from './AsignarMiembrosModal'
import { useEliminarRecursosProyecto } from '../hooks/useEliminarRecursosProyecto'
import { reordenarTareas } from '../services/proyecto.service'

import type { ListaDetalle, Tarea } from '../types'

type Props = {
  proyectoId: string
  lista: ListaDetalle
  esLider: boolean
  miUsuarioId: string | null
  isActive?: boolean
  onDragHandle?: () => void
  onChanged: () => Promise<void>
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number)

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(anio, mes - 1, dia))
}

type TareaItemProps = {
  tarea: Tarea
  indice: number
  eliminando: boolean
  esLider: boolean
  puedeEliminar: boolean
  isActive: boolean
  onOpen: () => void
  onAssign: () => void
  onDelete: () => void
  onDrag: () => void
}

function TareaItem({
  tarea,
  indice,
  eliminando,
  esLider,
  puedeEliminar,
  isActive,
  onOpen,
  onAssign,
  onDelete,
  onDrag,
}: TareaItemProps) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const colorNota = tarea.tarea_estado === 'COMPLETADA'
    ? styles.notaCompletada
    : tarea.tarea_estado === 'EN_PROGRESO'
      ? styles.notaEnProgreso
      : styles.notaPendiente

  return (
    <Pressable
      accessibilityLabel={`Editar tarea ${tarea.tarea_nombre}`}
      accessibilityRole="button"
      disabled={eliminando}
      onPress={onOpen}
      onLongPress={onDrag}
      delayLongPress={200}
      style={({ pressed }) => [
        styles.tarea,
        colorNota,
        indice % 3 === 0 && styles.notaInclinadaIzquierda,
        indice % 3 === 2 && styles.notaInclinadaDerecha,
        pressed && styles.tareaPressed,
        isActive && styles.tareaActiva,
      ]}
    >
      <View style={styles.pin} />
      <View style={styles.tareaTopRow}>
        <View style={styles.estado}>
          <Text style={styles.estadoText} numberOfLines={1}>
            {tarea.tarea_estado.replace('_', ' ')}
          </Text>
        </View>
        {puedeEliminar ? (
          <Pressable
            accessibilityLabel={`Eliminar tarea ${tarea.tarea_nombre}`}
            accessibilityRole="button"
            disabled={eliminando}
            hitSlop={6}
            onPress={(event) => {
              event.stopPropagation()
              onDelete()
            }}
            style={({ pressed }) => [
              styles.deleteTaskButton,
              pressed && styles.deleteButtonPressed,
            ]}
          >
            {eliminando ? (
              <ActivityIndicator size="small" color={colors.accentStrong} />
            ) : (
              <Ionicons name="trash-outline" size={17} color={colors.accentStrong} />
            )}
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.tareaNombre} numberOfLines={3}>
        {tarea.tarea_nombre}
      </Text>

      {tarea.tarea_desc ? (
        <Text style={styles.tareaDescripcion} numberOfLines={3}>
          {tarea.tarea_desc}
        </Text>
      ) : null}

      <View style={styles.tareaMeta}>
        <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
        <Text style={styles.tareaFecha}>
          {formatearFecha(tarea.tarea_fecha_entrega)}
        </Text>
      </View>

      <View style={styles.assignmentRow}>
        <View style={styles.assignees}>
          {tarea.asignaciones.length === 0 ? (
            <Text style={styles.noAssignees}>Sin responsables</Text>
          ) : (
            <>
              {tarea.asignaciones.slice(0, 3).map((asignacion) => (
                <View key={asignacion.asignacion_id} style={styles.assigneeAvatar}>
                  <Text style={styles.assigneeAvatarText}>
                    {asignacion.usuario_nombre.trim().charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              ))}
              {tarea.asignaciones.length > 3 ? (
                <Text style={styles.moreAssignees}>
                  +{tarea.asignaciones.length - 3}
                </Text>
              ) : null}
            </>
          )}
        </View>
        {esLider ? (
          <Pressable
            accessibilityLabel={`Asignar responsables a ${tarea.tarea_nombre}`}
            accessibilityRole="button"
            hitSlop={6}
            onPress={(event) => {
              event.stopPropagation()
              onAssign()
            }}
            style={({ pressed }) => [
              styles.assignButton,
              pressed && styles.assignButtonPressed,
            ]}
          >
            <Ionicons name="people-outline" size={17} color={colors.brandDark} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  )
}

export function ListaProyecto({
  proyectoId,
  lista,
  esLider,
  miUsuarioId,
  isActive,
  onDragHandle,
  onChanged,
}: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const [creandoTarea, setCreandoTarea] = useState(false)
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null)
  const [tareaAsignando, setTareaAsignando] = useState<Tarea | null>(null)
  const [tareas, setTareas] = useState(lista.tareas)
  const {
    eliminando,
    eliminarLista,
    eliminarTarea,
  } = useEliminarRecursosProyecto()
  const siguienteOrdenTarea = tareas.length === 0
    ? 0
    : Math.max(...tareas.map((tarea) => tarea.tarea_orden)) + 1

  useEffect(() => {
    setTareas(lista.tareas)
  }, [lista.tareas])

  async function manejarReordenTareas(data: Tarea[]) {
    setTareas(data)

    try {
      await reordenarTareas(
        lista.lista_id,
        data.map((tarea, indice) => ({ tareaId: tarea.tarea_id, orden: indice }))
      )
      await onChanged()
    } catch (error) {
      console.error('Error al reordenar tareas:', error)
      Alert.alert('No fue posible reordenar las tareas', 'Intenta nuevamente.')
      await onChanged()
    }
  }

  async function ejecutarEliminacionTarea(tareaId: string) {
    const eliminada = await eliminarTarea(tareaId)

    if (eliminada) {
      await onChanged()
      return
    }

    Alert.alert('No fue posible eliminar la tarea', 'Intenta nuevamente.')
  }

  function confirmarEliminacionTarea(tarea: Tarea) {
    Alert.alert(
      'Eliminar tarea',
      `¿Quieres eliminar "${tarea.tarea_nombre}" definitivamente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void ejecutarEliminacionTarea(tarea.tarea_id),
        },
      ]
    )
  }

  async function ejecutarEliminacionLista() {
    const eliminada = await eliminarLista(lista.lista_id)

    if (eliminada) {
      await onChanged()
      return
    }

    Alert.alert('No fue posible eliminar la lista', 'Intenta nuevamente.')
  }

  function solicitarEliminacionLista() {
    if (lista.tareas.length === 0) {
      void ejecutarEliminacionLista()
      return
    }

    Alert.alert(
      'Eliminar lista y tareas',
      `Esta lista contiene ${lista.tareas.length} ${
        lista.tareas.length === 1 ? 'tarea' : 'tareas'
      }. Se eliminarán definitivamente, incluidas sus asignaciones a otros miembros del proyecto.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: () => void ejecutarEliminacionLista(),
        },
      ]
    )
  }

  return (
    <View style={[styles.lista, isActive && styles.listaActiva]}>
      <View style={styles.header}>
        <Pressable
          style={styles.nombreContenedor}
          disabled={!esLider || !onDragHandle}
          onLongPress={onDragHandle}
          delayLongPress={200}
        >
          <Text style={styles.nombre} numberOfLines={2}>
            {lista.lista_nombre}
          </Text>
        </Pressable>
        <View style={styles.contador}>
          <Text style={styles.contadorText}>{lista.tareas.length}</Text>
        </View>
        <Pressable
          accessibilityLabel={`Crear tarea en ${lista.lista_nombre}`}
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => setCreandoTarea(true)}
          style={({ pressed }) => [
            styles.addTaskButton,
            pressed && styles.addTaskButtonPressed,
          ]}
        >
          <Ionicons name="add" size={19} color={colors.brand} />
        </Pressable>
        {esLider ? (
          <Pressable
            accessibilityLabel={`Eliminar lista ${lista.lista_nombre}`}
            accessibilityRole="button"
            disabled={eliminando === lista.lista_id}
            hitSlop={6}
            onPress={solicitarEliminacionLista}
            style={({ pressed }) => [
              styles.deleteListButton,
              pressed && styles.deleteButtonPressed,
            ]}
          >
            {eliminando === lista.lista_id ? (
              <ActivityIndicator size="small" color={colors.accentStrong} />
            ) : (
              <Ionicons name="trash-outline" size={18} color={colors.accentStrong} />
            )}
          </Pressable>
        ) : null}
      </View>

      {tareas.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons name="checkbox-outline" size={20} color="#8A918B" />
          <Text style={styles.vacioText}>Sin tareas</Text>
        </View>
      ) : (
        <DraggableFlatList
          data={tareas}
          keyExtractor={(tarea) => tarea.tarea_id}
          scrollEnabled={false}
          activationDistance={10}
          contentContainerStyle={styles.tareas}
          onDragEnd={({ data }) => void manejarReordenTareas(data)}
          renderItem={({ item: tarea, getIndex, drag, isActive }: RenderItemParams<Tarea>) => (
            <TareaItem
              tarea={tarea}
              indice={getIndex() ?? 0}
              eliminando={eliminando === tarea.tarea_id}
              esLider={esLider}
              puedeEliminar={esLider || tarea.tarea_creado_por === miUsuarioId}
              isActive={isActive}
              onOpen={() => setTareaEditando(tarea)}
              onAssign={() => setTareaAsignando(tarea)}
              onDelete={() => confirmarEliminacionTarea(tarea)}
              onDrag={drag}
            />
          )}
        />
      )}

      <TareaModal
        visible={creandoTarea || tareaEditando !== null}
        listaId={lista.lista_id}
        listaNombre={lista.lista_nombre}
        siguienteOrden={siguienteOrdenTarea}
        tarea={tareaEditando}
        onClose={() => {
          setCreandoTarea(false)
          setTareaEditando(null)
        }}
        onSaved={onChanged}
      />
      <AsignarMiembrosModal
        proyectoId={proyectoId}
        tarea={tareaAsignando}
        onClose={() => setTareaAsignando(null)}
        onChanged={onChanged}
      />
    </View>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  lista: {
    width: 292,
    alignSelf: 'flex-start',
    borderTopWidth: 6,
    borderTopColor: colors.brand,
    padding: 14,
    backgroundColor: colors.surface,
    gap: 14,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  listaActiva: {
    opacity: 0.92,
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.4,
    elevation: 10,
  },
  header: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nombreContenedor: {
    flex: 1,
  },
  nombre: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  contador: {
    minWidth: 26,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 7,
    backgroundColor: colors.brandSoft,
  },
  contadorText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '700',
  },
  addTaskButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  addTaskButtonPressed: {
    backgroundColor: colors.brandSoft,
  },
  deleteListButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  deleteTaskButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  deleteButtonPressed: {
    backgroundColor: colors.accentStrongSoft,
  },
  tareas: {
    gap: 14,
    paddingTop: 2,
  },
  tarea: {
    minHeight: 148,
    gap: 9,
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 13,
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tareaPressed: {
    opacity: 0.82,
  },
  tareaActiva: {
    opacity: 0.9,
    transform: [{ scale: 1.03 }],
    shadowOpacity: 0.35,
    elevation: 8,
  },
  notaPendiente: {
    backgroundColor: colors.notePending,
  },
  notaEnProgreso: {
    backgroundColor: colors.noteInProgress,
  },
  notaCompletada: {
    backgroundColor: colors.noteCompleted,
  },
  notaInclinadaIzquierda: {
    transform: [{ rotate: '-0.7deg' }],
  },
  notaInclinadaDerecha: {
    transform: [{ rotate: '0.7deg' }],
  },
  pin: {
    position: 'absolute',
    top: 7,
    left: '50%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    shadowColor: '#8C3D64',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 1,
    elevation: 2,
  },
  tareaTopRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tareaNombre: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  tareaDescripcion: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  tareaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  assignmentRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  assignees: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noAssignees: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  assigneeAvatar: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 13,
    marginRight: -5,
    backgroundColor: colors.brand,
  },
  assigneeAvatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  moreAssignees: { marginLeft: 9, color: colors.brandDark, fontSize: 11, fontWeight: '700' },
  assignButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.overlaySoft,
  },
  assignButtonPressed: { backgroundColor: colors.surface },
  tareaFecha: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  estado: {
    maxWidth: 125,
  },
  estadoText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  vacio: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.brandSoft,
  },
  vacioText: {
    color: colors.textMuted,
    fontSize: 13,
  },
})
}
