import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import type { InvitacionPendiente } from '../types'

type Props = {
  invitacion: InvitacionPendiente
  procesando: boolean
  deshabilitada: boolean
  onAccept: () => void
  onReject: () => void
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(fecha))
}

export function InvitacionCard({
  invitacion,
  procesando,
  deshabilitada,
  onAccept,
  onReject,
}: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Ionicons name="people-outline" size={25} color={colors.brand} />
      </View>
      <View style={styles.content}>
        <Text style={styles.projectName}>{invitacion.proyecto_nombre}</Text>
        <Text style={styles.description}>
          Te invitaron a colaborar en este proyecto.
        </Text>
        <Text style={styles.date}>{formatearFecha(invitacion.invitacion_fecha)}</Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={deshabilitada}
            onPress={onReject}
            style={styles.rejectButton}
          >
            <Text style={styles.rejectText}>Rechazar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={deshabilitada}
            onPress={onAccept}
            style={({ pressed }) => [
              styles.acceptButton,
              pressed && !deshabilitada && styles.acceptButtonPressed,
              deshabilitada && styles.disabled,
            ]}
          >
            {procesando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.acceptText}>Aceptar</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.surface,
  },
  icon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.brandSoft,
  },
  content: { minWidth: 0, flex: 1, gap: 6 },
  projectName: { color: colors.text, fontSize: 17, fontWeight: '700' },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  date: { color: '#8A918B', fontSize: 11 },
  actions: { flexDirection: 'row', gap: 9, paddingTop: 8 },
  rejectButton: {
    minHeight: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  rejectText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  acceptButton: {
    minHeight: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  acceptButtonPressed: { backgroundColor: colors.accentPressed },
  acceptText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.65 },
  })
}
