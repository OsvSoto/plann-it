import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { CrearListaModal } from './CrearListaModal'
import { ListaProyecto } from './ListaProyecto'

import type { TableroDetalle } from '../types'

type Props = {
  tablero: TableroDetalle
  esLider: boolean
  onChanged: () => Promise<void>
}

export function TableroProyecto({ tablero, esLider, onChanged }: Props) {
  const [creandoLista, setCreandoLista] = useState(false)
  const siguienteOrden = tablero.listas.length === 0
    ? 0
    : Math.max(...tablero.listas.map((lista) => lista.lista_orden)) + 1

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.boardLabel}>
          <Ionicons name="pin-outline" size={18} color="#F6F8F6" />
          <Text style={styles.boardLabelText}>ESPACIO DE TRABAJO</Text>
        </View>
        {esLider ? (
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
              lista={lista}
              esLider={esLider}
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
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4F2D7F',
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
  addListButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FF6B2C',
  },
  addListButtonPressed: {
    backgroundColor: '#E8521D',
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
    backgroundColor: '#E9E1F3',
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
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-1deg' }],
    shadowColor: '#4F2D7F',
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
    backgroundColor: '#FF6B2C',
  },
  vacioTitle: {
    color: '#342247',
    fontSize: 17,
    fontWeight: '700',
  },
  vacioText: {
    color: '#62566E',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
})
