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

import { CrearTareaModal } from './CrearTareaModal'
import { useEliminarRecursosProyecto } from '../hooks/useEliminarRecursosProyecto'

import type { ListaDetalle, Tarea } from '../types'

type Props = {
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
  eliminando: boolean
  onDelete: () => void
}

function TareaItem({ tarea, eliminando, onDelete }: TareaItemProps) {
  return (
    <View style={styles.tarea}>
      <View style={styles.tareaInfo}>
        <Text style={styles.tareaNombre} numberOfLines={2}>
          {tarea.tarea_nombre}
        </Text>
        <View style={styles.tareaMeta}>
          <Ionicons name="calendar-outline" size={14} color="#667069" />
          <Text style={styles.tareaFecha}>
            {formatearFecha(tarea.tarea_fecha_entrega)}
          </Text>
        </View>
      </View>
      <View style={styles.estado}>
        <Text style={styles.estadoText} numberOfLines={1}>
          {tarea.tarea_estado}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={`Eliminar tarea ${tarea.tarea_nombre}`}
        accessibilityRole="button"
        disabled={eliminando}
        hitSlop={6}
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteTaskButton,
          pressed && styles.deleteButtonPressed,
        ]}
      >
        {eliminando ? (
          <ActivityIndicator size="small" color="#B42318" />
        ) : (
          <Ionicons name="trash-outline" size={17} color="#B42318" />
        )}
      </Pressable>
    </View>
  )
}

export function ListaProyecto({ lista, esLider, onChanged }: Props) {
  const [creandoTarea, setCreandoTarea] = useState(false)
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
          <Ionicons name="add" size={19} color="#166534" />
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
          {lista.tareas.map((tarea) => (
            <TareaItem
              key={tarea.tarea_id}
              tarea={tarea}
              eliminando={eliminando === tarea.tarea_id}
              onDelete={() => confirmarEliminacionTarea(tarea)}
            />
          ))}
        </View>
      )}

      <CrearTareaModal
        visible={creandoTarea}
        listaId={lista.lista_id}
        listaNombre={lista.lista_nombre}
        onClose={() => setCreandoTarea(false)}
        onCreated={onChanged}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  lista: {
    width: 286,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#DDE2DE',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  header: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nombre: {
    flex: 1,
    color: '#273029',
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
    backgroundColor: '#EEF1EE',
  },
  contadorText: {
    color: '#59615B',
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
    backgroundColor: '#EAF4ED',
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
    gap: 8,
  },
  tarea: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDF0ED',
    paddingTop: 10,
  },
  tareaInfo: {
    flex: 1,
    gap: 6,
  },
  tareaNombre: {
    color: '#273029',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  tareaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tareaFecha: {
    color: '#667069',
    fontSize: 12,
  },
  estado: {
    maxWidth: 88,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    backgroundColor: '#EAF4ED',
  },
  estadoText: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  vacio: {
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#EDF0ED',
  },
  vacioText: {
    color: '#747C76',
    fontSize: 13,
  },
})
