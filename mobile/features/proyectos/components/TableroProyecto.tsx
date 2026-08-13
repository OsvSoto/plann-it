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
        <View style={styles.icon}>
          <Ionicons name="grid-outline" size={18} color="#166534" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.nombre}>{tablero.tablero_nombre}</Text>
          <Text style={styles.resumen}>
            {tablero.listas.length}{' '}
            {tablero.listas.length === 1 ? 'lista' : 'listas'}
          </Text>
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
            <Ionicons name="add" size={18} color="#166534" />
            <Text style={styles.addListText}>Nueva lista</Text>
          </Pressable>
        ) : null}
      </View>

      {tablero.listas.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioText}>Este tablero aún no tiene listas.</Text>
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
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  nombre: {
    color: '#172019',
    fontSize: 18,
    fontWeight: '700',
  },
  resumen: {
    color: '#667069',
    fontSize: 12,
  },
  addListButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#86B694',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  addListButtonPressed: {
    backgroundColor: '#EAF4ED',
  },
  addListText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  listas: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  vacio: {
    marginHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#AAB2AC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#EEF1EE',
  },
  vacioText: {
    color: '#59615B',
    fontSize: 14,
  },
})
