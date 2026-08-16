import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppColors } from '../../../constants/theme'
import { useAdministrarMiembro } from '../hooks/useAdministrarMiembro'

import type { MiembroProyecto, RolMiembro } from '../types'

type Props = {
  miembro: MiembroProyecto | null
  onClose: () => void
  onUpdated: () => Promise<void>
}

const OPCIONES: Array<{
  rol: RolMiembro
  titulo: string
  descripcion: string
  icono: keyof typeof Ionicons.glyphMap
}> = [
  {
    rol: 'MIEMBRO',
    titulo: 'Miembro',
    descripcion: 'Puede colaborar en el trabajo del proyecto.',
    icono: 'person-outline',
  },
  {
    rol: 'LIDER',
    titulo: 'Líder',
    descripcion: 'Acceso total, incluida la administración del equipo.',
    icono: 'shield-checkmark-outline',
  },
]

export function AdministrarMiembroModal({
  miembro,
  onClose,
  onUpdated,
}: Props) {
  const [rol, setRol] = useState<RolMiembro>('MIEMBRO')
  const {
    procesando,
    error,
    limpiarError,
    actualizar,
    eliminar,
  } = useAdministrarMiembro()

  useEffect(() => {
    if (miembro) {
      setRol(miembro.miembro_rol)
    }
  }, [miembro])

  function cerrar() {
    if (!procesando) {
      limpiarError()
      onClose()
    }
  }

  async function guardar() {
    if (!miembro) {
      return
    }

    const actualizado = await actualizar({
      miembroId: miembro.miembro_proyecto_id,
      rol,
      permisos: rol === 'LIDER' ? 'TOTAL' : 'COLABORAR',
    })

    if (actualizado) {
      await onUpdated()
      onClose()
    }
  }

  async function ejecutarEliminacion() {
    if (!miembro) {
      return
    }

    const eliminado = await eliminar(miembro.miembro_proyecto_id)

    if (eliminado) {
      await onUpdated()
      onClose()
    }
  }

  function confirmarEliminacion() {
    if (!miembro) {
      return
    }

    limpiarError()
    Alert.alert(
      'Quitar del proyecto',
      `${miembro.usuario_nombre} perderá¡ el acceso. Sus tareas quedarán sin asignar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar miembro',
          style: 'destructive',
          onPress: () => void ejecutarEliminacion(),
        },
      ]
    )
  }

  return (
    <Modal
      visible={miembro !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={cerrar}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Administrar miembro</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {miembro?.usuario_nombre}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              disabled={procesando}
              hitSlop={8}
              onPress={cerrar}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={23} color={AppColors.brandDark} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Rol y permisos</Text>
              <Text style={styles.helpText}>
                Selecciona el nivel de acceso que tendrá dentro del proyecto.
              </Text>
              <View style={styles.options}>
                {OPCIONES.map((opcion) => {
                  const seleccionada = rol === opcion.rol

                  return (
                    <Pressable
                      key={opcion.rol}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: seleccionada }}
                      disabled={procesando}
                      onPress={() => {
                        setRol(opcion.rol)
                        limpiarError()
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        seleccionada && styles.optionSelected,
                        pressed && styles.optionPressed,
                      ]}
                    >
                      <View style={styles.optionIcon}>
                        <Ionicons
                          name={opcion.icono}
                          size={21}
                          color={seleccionada ? AppColors.brand : AppColors.textMuted}
                        />
                      </View>
                      <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>{opcion.titulo}</Text>
                        <Text style={styles.optionDescription}>
                          {opcion.descripcion}
                        </Text>
                      </View>
                      <Ionicons
                        name={seleccionada ? 'radio-button-on' : 'radio-button-off'}
                        size={21}
                        color={seleccionada ? AppColors.brand : AppColors.border}
                      />
                    </Pressable>
                  )
                })}
              </View>
            </View>

            {error ? (
              <View style={styles.error} accessibilityRole="alert">
                <Ionicons name="alert-circle-outline" size={19} color={AppColors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.dangerZone}>
              <View style={styles.dangerText}>
                <Text style={styles.dangerTitle}>Quitar del proyecto</Text>
                <Text style={styles.dangerDescription}>
                  Se cancelará su acceso y sus asignaciones actuales.
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={procesando}
                onPress={confirmarEliminacion}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.deleteButtonPressed,
                ]}
              >
                <Ionicons name="person-remove-outline" size={19} color={AppColors.danger} />
                <Text style={styles.deleteText}>Quitar</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              disabled={procesando}
              onPress={cerrar}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={procesando || rol === miembro?.miembro_rol}
              onPress={() => void guardar()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                (procesando || rol === miembro?.miembro_rol) && styles.disabled,
              ]}
            >
              {procesando ? (
                <ActivityIndicator size="small" color={AppColors.surface} />
              ) : (
                <Text style={styles.primaryText}>Guardar cambios</Text>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: AppColors.background },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  headerText: { flex: 1, gap: 4 },
  title: { color: AppColors.text, fontSize: 23, fontWeight: '700' },
  subtitle: { color: AppColors.textMuted, fontSize: 14 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  content: { flex: 1, gap: 22, paddingTop: 30 },
  field: { gap: 7 },
  label: { color: AppColors.brandDark, fontSize: 15, fontWeight: '700' },
  helpText: { color: AppColors.textMuted, fontSize: 13, lineHeight: 19 },
  options: { gap: 10, paddingTop: 7 },
  option: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: AppColors.surface,
  },
  optionSelected: { borderColor: AppColors.brand, backgroundColor: AppColors.brandSoft },
  optionPressed: { opacity: 0.82 },
  optionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.background,
  },
  optionText: { flex: 1, gap: 3 },
  optionTitle: { color: AppColors.text, fontSize: 14, fontWeight: '700' },
  optionDescription: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.danger,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: AppColors.dangerSoft,
  },
  errorText: { flex: 1, color: AppColors.danger, fontSize: 14, lineHeight: 20 },
  dangerZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 18,
  },
  dangerText: { flex: 1, gap: 3 },
  dangerTitle: { color: AppColors.text, fontSize: 14, fontWeight: '700' },
  dangerDescription: { color: AppColors.textMuted, fontSize: 12, lineHeight: 17 },
  deleteButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: AppColors.danger,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  deleteButtonPressed: { backgroundColor: AppColors.dangerSoft },
  deleteText: { color: AppColors.danger, fontSize: 13, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 14 },
  secondaryButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
  },
  secondaryText: { color: AppColors.brandDark, fontSize: 15, fontWeight: '600' },
  primaryButton: {
    minHeight: 48,
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.accent,
  },
  primaryButtonPressed: { backgroundColor: AppColors.accentPressed },
  primaryText: { color: AppColors.surface, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.5 },
})
