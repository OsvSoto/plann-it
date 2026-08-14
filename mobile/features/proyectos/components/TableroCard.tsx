import { Ionicons } from '@expo/vector-icons'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import type { TableroDetalle } from '../types'

type Props = {
  tablero: TableroDetalle
  onPress: () => void
}

const COLORES_NOTA = ['#FFE0B8', '#DCCEF0', '#FFD0C4']

export function TableroCard({ tablero, onPress }: Props) {
  const cantidadTareas = tablero.listas.reduce(
    (total, lista) => total + lista.tareas.length,
    0
  )
  const tareasVistaPrevia = tablero.listas
    .flatMap((lista) => lista.tareas)
    .slice(0, 3)

  return (
    <Pressable
      accessibilityLabel={`Abrir tablero ${tablero.tablero_nombre}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.preview}>
        <View style={styles.previewTopBar} />
        {tareasVistaPrevia.length === 0 ? (
          <View style={styles.emptyPreview}>
            <Ionicons name="documents-outline" size={25} color="#8B67B5" />
          </View>
        ) : (
          <View style={styles.notesPreview}>
            {tareasVistaPrevia.map((tarea, index) => (
              <View
                key={tarea.tarea_id}
                style={[
                  styles.previewNote,
                  { backgroundColor: COLORES_NOTA[index] },
                  index === 0 && styles.previewNoteLeft,
                  index === 2 && styles.previewNoteRight,
                ]}
              >
                <View style={styles.previewPin} />
                <View style={styles.previewLineLong} />
                <View style={styles.previewLineShort} />
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {tablero.tablero_nombre}
          </Text>
          <View style={styles.openButton}>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="albums-outline" size={15} color="#6F45A5" />
            <Text style={styles.metaText}>
              {tablero.listas.length} {tablero.listas.length === 1 ? 'lista' : 'listas'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={15} color="#FF6B2C" />
            <Text style={styles.metaText}>
              {cantidadTareas} {cantidadTareas === 1 ? 'tarea' : 'tareas'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  cardPressed: {
    opacity: 0.86,
  },
  preview: {
    height: 132,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#C7B5DD',
    backgroundColor: '#E9E1F3',
  },
  previewTopBar: {
    height: 9,
    backgroundColor: '#5B378D',
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesPreview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    paddingHorizontal: 18,
  },
  previewNote: {
    width: 70,
    height: 72,
    padding: 12,
    shadowColor: '#4F2D7F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 3,
  },
  previewNoteLeft: {
    transform: [{ rotate: '-3deg' }],
  },
  previewNoteRight: {
    transform: [{ rotate: '2deg' }],
  },
  previewPin: {
    position: 'absolute',
    top: 6,
    left: 31,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF6B2C',
  },
  previewLineLong: {
    height: 4,
    marginTop: 13,
    backgroundColor: 'rgba(39, 48, 41, 0.42)',
  },
  previewLineShort: {
    width: '65%',
    height: 4,
    marginTop: 8,
    backgroundColor: 'rgba(39, 48, 41, 0.28)',
  },
  content: {
    gap: 13,
    padding: 16,
  },
  titleRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#342247',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 23,
  },
  openButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FF6B2C',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#62566E',
    fontSize: 12,
    fontWeight: '600',
  },
})
