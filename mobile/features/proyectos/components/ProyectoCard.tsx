import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import type { Proyecto } from '../types'

type Props = {
  proyecto: Proyecto
  onPress: () => void
}

export function ProyectoCard({ proyecto, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir proyecto ${proyecto.proyecto_nombre}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.nombre} numberOfLines={2}>
          {proyecto.proyecto_nombre}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#6F45A5" />
      </View>

      {proyecto.proyecto_descripcion ? (
        <Text style={styles.descripcion}>
          {proyecto.proyecto_descripcion}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.estado}>
          <Text style={styles.estadoText}>{proyecto.proyecto_estado}</Text>
        </View>
        <Text style={styles.fecha}>Hasta {proyecto.proyecto_fecha_fin}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  cardPressed: {
    backgroundColor: '#F4EFF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nombre: {
    flex: 1,
    color: '#342247',
    fontSize: 18,
    fontWeight: '700',
  },
  descripcion: {
    color: '#62566E',
    fontSize: 15,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  estado: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF0E8',
  },
  estadoText: {
    color: '#D94D1C',
    fontSize: 11,
    fontWeight: '700',
  },
  fecha: {
    flexShrink: 1,
    color: '#766682',
    fontSize: 12,
    textAlign: 'right',
  },
})
