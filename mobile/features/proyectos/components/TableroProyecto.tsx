import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import { CrearListaModal } from './CrearListaModal'
import { CrearTableroModal } from './CrearTableroModal'
import { ListaProyecto } from './ListaProyecto'
import { useEliminarRecursosProyecto } from '../hooks/useEliminarRecursosProyecto'

import type { TableroDetalle } from '../types'

type Props = {
  tablero: TableroDetalle
  esLider: boolean
  miUsuarioId: string | null
  onChanged: () => Promise<void>
}

export function TableroProyecto({ tablero, esLider, miUsuarioId, onChanged }: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const [creandoLista, setCreandoLista] = useState(false)
  const [editandoTablero, setEditandoTablero] = useState(false)
  const { eliminando, eliminarTablero } = useEliminarRecursosProyecto()
  const siguienteOrden = tablero.listas.length === 0
    ? 0
    : Math.max(...tablero.listas.map((lista) => lista.lista_orden)) + 1

  async function ejecutarEliminacionTablero() {
    const eliminado = await eliminarTablero(tablero.tablero_id)

    if (eliminado) {
      router.back()
      return
    }

    Alert.alert('No fue posible eliminar el tablero', 'Intenta nuevamente.')
  }

  function solicitarEliminacionTablero() {
    const cantidadListas = tablero.listas.length
    const mensaje = cantidadListas === 0
      ? `¿Quieres eliminar el tablero "${tablero.tablero_nombre}" definitivamente?`
      : `El tablero "${tablero.tablero_nombre}" tiene ${cantidadListas} ${
        cantidadListas === 1 ? 'lista' : 'listas'
      }. Se eliminarán definitivamente, incluidas todas sus tareas y asignaciones.`

    Alert.alert(
      'Eliminar tablero',
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: () => void ejecutarEliminacionTablero(),
        },
      ]
    )
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.boardLabel}>
          <Ionicons name="pin-outline" size={18} color="#F6F8F6" />
          <Text style={styles.boardLabelText}>ESPACIO DE TRABAJO</Text>
        </View>
        {esLider ? (
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel={`Editar tablero ${tablero.tablero_nombre}`}
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => setEditandoTablero(true)}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Ionicons name="create-outline" size={19} color="#F6F8F6" />
            </Pressable>
            <Pressable
              accessibilityLabel={`Eliminar tablero ${tablero.tablero_nombre}`}
              accessibilityRole="button"
              disabled={eliminando === tablero.tablero_id}
              hitSlop={6}
              onPress={solicitarEliminacionTablero}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              {eliminando === tablero.tablero_id ? (
                <ActivityIndicator size="small" color="#F6F8F6" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#F6F8F6" />
              )}
            </Pressable>
            <Pressable
              accessibilityLabel={`Crear lista en ${tablero.tablero_nombre}`}
              accessibilityRole="button"
              onPress={() => setCreandoLista(true)}
              style={({ pressed }) => [
                styles.addListButton,
                pressed && styles.addListButtonPressed,
              ]}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addListText}>Añadir lista</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.boardSurface}>
        {tablero.listas.length === 0 ? (
          <View style={styles.vacio}>
            <View style={styles.emptyPaper}>
              <View style={styles.emptyPin} />
              <Ionicons name="documents-outline" size={28} color="#6F45A5" />
              <Text style={styles.vacioTitle}>Tablero vacío</Text>
              <Text style={styles.vacioText}>Añade una lista para comenzar a organizar tareas.</Text>
            </View>
          </View>
        ) : (
          <ScrollView
            horizontal
            contentContainerStyle={styles.listas}
            showsHorizontalScrollIndicator={false}
          >
          {tablero.listas.map((lista) => (
            <ListaProyecto
              key={lista.lista_id}
              proyectoId={tablero.tablero_proyecto_id}
              lista={lista}
              esLider={esLider}
              miUsuarioId={miUsuarioId}
              onChanged={onChanged}
            />
          ))}
          </ScrollView>
        )}
      </View>

      <CrearListaModal
        visible={creandoLista}
        tableroId={tablero.tablero_id}
        siguienteOrden={siguienteOrden}
        onClose={() => setCreandoLista(false)}
        onCreated={onChanged}
      />
      <CrearTableroModal
        visible={editandoTablero}
        proyectoId={tablero.tablero_proyecto_id}
        tablero={tablero}
        onClose={() => setEditandoTablero(false)}
        onCreated={onChanged}
      />
    </View>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  section: {
    marginHorizontal: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.brandDark,
    borderRadius: 8,
    backgroundColor: '#5B378D',
    shadowColor: '#3B205F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 5,
  },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  boardLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  boardLabelText: {
    color: '#F6F8F6',
    fontSize: 11,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  addListButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.accent,
  },
  addListButtonPressed: {
    backgroundColor: colors.accentPressed,
  },
  addListText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  boardSurface: {
    minHeight: 430,
    borderTopWidth: 1,
    borderTopColor: '#A98ACB',
    backgroundColor: colors.brandSoft,
  },
  listas: {
    alignItems: 'flex-start',
    gap: 18,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 26,
  },
  vacio: {
    minHeight: 430,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  emptyPaper: {
    width: '100%',
    maxWidth: 310,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: colors.surface,
    transform: [{ rotate: '-1deg' }],
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyPin: {
    position: 'absolute',
    top: 12,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  vacioTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  vacioText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
})
}
