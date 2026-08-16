import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import { useCrearTablero } from '../hooks/useCrearTablero'

type Props = {
  visible: boolean
  proyectoId: string
  onClose: () => void
  onCreated: () => Promise<void>
}

export function CrearTableroModal({
  visible,
  proyectoId,
  onClose,
  onCreated,
}: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const {
    nombre,
    guardando,
    error,
    actualizarNombre,
    reiniciar,
    guardar,
  } = useCrearTablero()

  function cerrar() {
    if (guardando) {
      return
    }

    reiniciar()
    onClose()
  }

  async function crear() {
    const creado = await guardar(proyectoId)

    if (creado) {
      onClose()
      await onCreated()
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={cerrar}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Nuevo tablero</Text>
              <Text style={styles.subtitle}>Organiza las listas del proyecto</Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              hitSlop={8}
              onPress={cerrar}
              disabled={guardando}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <Ionicons name="close" size={23} color={colors.brandDark} />
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                autoFocus
                autoCorrect={false}
                editable={!guardando}
                maxLength={100}
                placeholder="Ej. Desarrollo de la aplicación"
                placeholderTextColor="#8A918B"
                returnKeyType="done"
                style={styles.input}
                value={nombre}
                onChangeText={actualizarNombre}
                onSubmitEditing={() => {
                  void crear()
                }}
              />
            </View>

            {error ? (
              <View style={styles.error} accessibilityRole="alert">
                <Ionicons name="alert-circle-outline" size={19} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable
              disabled={guardando}
              onPress={cerrar}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={guardando}
              onPress={() => {
                void crear()
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !guardando && styles.primaryButtonPressed,
                guardando && styles.buttonDisabled,
              ]}
            >
              {guardando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Crear tablero</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  closeButtonPressed: {
    backgroundColor: '#E8ECE9',
  },
  form: {
    flex: 1,
    paddingTop: 34,
    gap: 18,
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.brandDark,
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D92D20',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    flex: 1,
    color: '#912018',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 16,
  },
  secondaryButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  secondaryButtonPressed: {
    backgroundColor: '#F0EAF6',
  },
  secondaryButtonText: {
    color: colors.brandDark,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 48,
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  primaryButtonPressed: {
    backgroundColor: colors.accentPressed,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
})
}
