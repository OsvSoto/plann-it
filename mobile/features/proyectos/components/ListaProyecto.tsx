import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { TareaModal } from './CrearTareaModal'
import { AsignarMiembrosModal } from './AsignarMiembrosModal'
import { useEliminarRecursosProyecto } from '../hooks/useEliminarRecursosProyecto'

import type { ListaDetalle, Tarea } from '../types'

type Props = {
  proyectoId: string
  lista: ListaDetalle
  esLider: boolean
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
  onOpen: () => void
  onAssign: () => void
  onDelete: () => void
}

function TareaItem({
  tarea,
  indice,
  eliminando,
  esLider,
  onOpen,
  onAssign,
  onDelete,
}: TareaItemProps) {
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
      style={({ pressed }) => [
        styles.tarea,
        colorNota,
        indice % 3 === 0 && styles.notaInclinadaIzquierda,
        indice % 3 === 2 && styles.notaInclinadaDerecha,
        pressed && styles.tareaPressed,
      ]}
    >
      <View style={styles.pin} />
      <View style={styles.tareaTopRow}>
        <View style={styles.estado}>
          <Text style={styles.estadoText} numberOfLines={1}>
            {tarea.tarea_estado.replace('_', ' ')}
          </Text>
        </View>
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
            <ActivityIndicator size="small" color="#7A271A" />
          ) : (
            <Ionicons name="trash-outline" size={17} color="#7A271A" />
          )}
        </Pressable>
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
        <Ionicons name="calendar-outline" size={14} color="#5D4D68" />
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
            <Ionicons name="people-outline" size={17} color="#4F2D7F" />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  )
}

export function ListaProyecto({ proyectoId, lista, esLider, onChanged }: Props) {
  const [creandoTarea, setCreandoTarea] = useState(false)
  const [tareaEditando, setTareaEditando] = useState<Tarea | null>(null)
  const [tareaAsignando, setTareaAsignando] = useState<Tarea | null>(null)
  const {
    eliminando,
    eliminarLista,
    eliminarTarea,
  } = useEliminarRecursosProyecto()

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
    <View style={styles.lista}>
      <View style={styles.header}>
        <Text style={styles.nombre} numberOfLines={2}>
          {lista.lista_nombre}
        </Text>
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
          <Ionicons name="add" size={19} color="#6F45A5" />
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
              <ActivityIndicator size="small" color="#B42318" />
            ) : (
              <Ionicons name="trash-outline" size={18} color="#B42318" />
            )}
          </Pressable>
        ) : null}
      </View>

      {lista.tareas.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons name="checkbox-outline" size={20} color="#8A918B" />
          <Text style={styles.vacioText}>Sin tareas</Text>
        </View>
      ) : (
        <View style={styles.tareas}>
          {lista.tareas.map((tarea, indice) => (
            <TareaItem
              key={tarea.tarea_id}
              tarea={tarea}
              indice={indice}
              eliminando={eliminando === tarea.tarea_id}
              esLider={esLider}
              onOpen={() => setTareaEditando(tarea)}
              onAssign={() => setTareaAsignando(tarea)}
              onDelete={() => confirmarEliminacionTarea(tarea)}
            />
          ))}
        </View>
      )}

      <TareaModal
        visible={creandoTarea || tareaEditando !== null}
        listaId={lista.lista_id}
        listaNombre={lista.lista_nombre}
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

const styles = StyleSheet.create({
  lista: {
    width: 292,
    alignSelf: 'flex-start',
    borderTopWidth: 6,
    borderTopColor: '#6F45A5',
    padding: 14,
    backgroundColor: '#FCFAFE',
    gap: 14,
    shadowColor: '#4F2D7F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nombre: {
    flex: 1,
    color: '#342247',
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
    backgroundColor: '#E9E1F3',
  },
  contadorText: {
    color: '#6F45A5',
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
    backgroundColor: '#EEE7F6',
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
    backgroundColor: '#FEF3F2',
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
    shadowColor: '#4F2D7F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tareaPressed: {
    opacity: 0.82,
  },
  notaPendiente: {
    backgroundColor: '#FFE0B8',
  },
  notaEnProgreso: {
    backgroundColor: '#DCCEF0',
  },
  notaCompletada: {
    backgroundColor: '#FFD0C4',
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
    backgroundColor: '#FF6B2C',
    shadowColor: '#A73812',
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
    color: '#342247',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  tareaDescripcion: {
    color: '#55475F',
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
  noAssignees: { color: '#766682', fontSize: 11, fontWeight: '600' },
  assigneeAvatar: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 13,
    marginRight: -5,
    backgroundColor: '#6F45A5',
  },
  assigneeAvatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  moreAssignees: { marginLeft: 9, color: '#4F2D7F', fontSize: 11, fontWeight: '700' },
  assignButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF80',
  },
  assignButtonPressed: { backgroundColor: '#FFFFFF' },
  tareaFecha: {
    color: '#5D4D68',
    fontSize: 12,
    fontWeight: '600',
  },
  estado: {
    maxWidth: 125,
  },
  estadoText: {
    color: '#503A63',
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
    borderColor: '#CDBDDF',
    backgroundColor: '#F0EAF6',
  },
  vacioText: {
    color: '#766682',
    fontSize: 13,
  },
})
