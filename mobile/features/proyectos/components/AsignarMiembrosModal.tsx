import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import { useAsignacionesTarea } from '../hooks/useAsignacionesTarea'

import type { Tarea } from '../types'

type Props = {
  proyectoId: string
  tarea: Tarea | null
  onClose: () => void
  onChanged: () => Promise<void>
}

function inicial(nombre: string) {
  return nombre.trim().charAt(0).toUpperCase() || '?'
}

export function AsignarMiembrosModal({
  proyectoId,
  tarea,
  onClose,
  onChanged,
}: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const {
    miembros,
    asignaciones,
    cargando,
    procesandoMiembroId,
    error,
    cargar,
    alternar,
  } = useAsignacionesTarea({
    visible: tarea !== null,
    proyectoId,
    tareaId: tarea?.tarea_id ?? null,
    onChanged,
  })

  const procesando = procesandoMiembroId !== null

  return (
    <Modal
      visible={tarea !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Asignar responsables</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {tarea?.tarea_nombre}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              disabled={procesando}
              hitSlop={8}
              onPress={onClose}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={23} color={colors.brandDark} />
            </Pressable>
          </View>

          <View style={styles.info}>
            <Ionicons name="information-circle-outline" size={20} color={colors.brand} />
            <Text style={styles.infoText}>
              Selecciona las personas responsables de completar esta tarea.
            </Text>
          </View>

          {cargando && miembros.length === 0 ? (
            <View style={styles.state}>
              <ActivityIndicator size="small" color={colors.brand} />
              <Text style={styles.stateText}>Cargando equipo...</Text>
            </View>
          ) : error && miembros.length === 0 ? (
            <View style={styles.state}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => void cargar()}>
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.members}
              showsVerticalScrollIndicator={false}
            >
              {miembros.map((miembro) => {
                const asignado = asignaciones.some(
                  (asignacion) => asignacion.miembro_proyecto_id
                    === miembro.miembro_proyecto_id
                )
                const procesandoActual = procesandoMiembroId
                  === miembro.miembro_proyecto_id

                return (
                  <Pressable
                    key={miembro.miembro_proyecto_id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: asignado }}
                    disabled={procesando}
                    onPress={() => void alternar(miembro)}
                    style={({ pressed }) => [
                      styles.member,
                      asignado && styles.memberSelected,
                      pressed && styles.memberPressed,
                    ]}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {inicial(miembro.usuario_nombre)}
                      </Text>
                    </View>
                    <View style={styles.memberText}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {miembro.usuario_nombre}
                      </Text>
                      <Text style={styles.memberEmail} numberOfLines={1}>
                        {miembro.usuario_correo}
                      </Text>
                    </View>
                    {procesandoActual ? (
                      <ActivityIndicator size="small" color={colors.brand} />
                    ) : (
                      <Ionicons
                        name={asignado ? 'checkbox' : 'square-outline'}
                        size={23}
                        color={asignado ? colors.brand : colors.textMuted}
                      />
                    )}
                  </Pressable>
                )
              })}

              {error ? (
                <View style={styles.error} accessibilityRole="alert">
                  <Ionicons name="alert-circle-outline" size={19} color={colors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </ScrollView>
          )}

          <Pressable
            accessibilityRole="button"
            disabled={procesando}
            onPress={onClose}
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.doneButtonPressed,
              procesando && styles.disabled,
            ]}
          >
            <Text style={styles.doneText}>Listo</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  headerText: { flex: 1, gap: 4 },
  title: { color: colors.text, fontSize: 23, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 19 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.brandSoft,
  },
  infoText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 9 },
  stateText: { color: colors.textMuted, fontSize: 13 },
  retryText: { color: colors.brand, fontSize: 13, fontWeight: '700' },
  members: { gap: 10, paddingBottom: 12 },
  member: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 11,
    backgroundColor: colors.surface,
  },
  memberSelected: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  memberPressed: { opacity: 0.8 },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  avatarText: { color: colors.brandDark, fontSize: 16, fontWeight: '800' },
  memberText: { minWidth: 0, flex: 1, gap: 2 },
  memberName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  memberEmail: { color: colors.textMuted, fontSize: 12 },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.dangerSoft,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 13, lineHeight: 19 },
  doneButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  doneButtonPressed: { backgroundColor: colors.accentPressed },
  doneText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
})
}
