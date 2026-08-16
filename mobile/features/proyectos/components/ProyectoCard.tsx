import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import { ESTADO_PROYECTO_COLORS } from '../types'
import type { EstadoProyecto, Proyecto } from '../types'

type Props = {
  proyecto: Proyecto
  onPress?: () => void
}

export function ProyectoCard({ proyecto, onPress }: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const router = useRouter()

  const handlePress = () => {
    if (onPress) {
      onPress()
      return
    }
  }

  const handleIrGantt = () => {
    router.push(`/carta-gantt/${proyecto.proyecto_id}`)
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir proyecto ${proyecto.proyecto_nombre}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.nombre} numberOfLines={2}>
          {proyecto.proyecto_nombre}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={colors.brand} />
      </View>

      {proyecto.proyecto_descripcion ? (
        <Text style={styles.descripcion}>
          {proyecto.proyecto_descripcion}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View
          style={[
            styles.estado,
            { backgroundColor: ESTADO_PROYECTO_COLORS[proyecto.proyecto_estado as EstadoProyecto].background },
          ]}
        >
          <Text
            style={[
              styles.estadoText,
              { color: ESTADO_PROYECTO_COLORS[proyecto.proyecto_estado as EstadoProyecto].color },
            ]}
          >
            {proyecto.proyecto_estado}
          </Text>
        </View>
        <Text style={styles.fecha}>Hasta {proyecto.proyecto_fecha_fin}</Text>
      </View>
    </Pressable>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.surface,
    gap: 12,
  },
  cardPressed: {
    backgroundColor: colors.brandSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nombre: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  descripcion: {
    color: colors.textMuted,
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
  },
  estadoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fecha: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
  },
  btnGantt: {
    backgroundColor: colors.brand,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnGanttPressed: {
    backgroundColor: colors.brandDark,
  },
  btnGanttText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  })
}