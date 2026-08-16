import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'

import { CampoFecha } from './CampoFecha'
import { useEditarProyecto } from '../hooks/useEditarProyecto'

import type { Proyecto } from '../types'
import { ESTADO_PROYECTO_COLORS, ESTADOS_PROYECTO } from '../types'

type Props = {
  visible: boolean
  proyecto: Proyecto | null
  onCerrar: () => void
  onGuardado: () => Promise<void> | void
}

export function EditarProyectoModal({
  visible,
  proyecto,
  onCerrar,
  onGuardado,
}: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const {
    formulario,
    guardando,
    error,
    actualizarCampo,
    guardarCambios,
  } = useEditarProyecto(proyecto)

  function cerrar() {
    if (guardando) {
      return
    }

    onCerrar()
  }

  async function guardar() {
    const guardado = await guardarCambios()
    if (!guardado) return

    try {
      await onGuardado()
      onCerrar()
    } catch (error) {
      console.error('Error en callback:', error)
      // El modal permanece abierto para reintentar
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={cerrar}
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'right', 'bottom', 'left']}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={
            Platform.OS === 'ios'
              ? 'height'
              : undefined
          }
          keyboardVerticalOffset={0}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                Editar proyecto
              </Text>

              <Text style={styles.subtitle}>
                Actualiza la información general del proyecto
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              hitSlop={8}
              onPress={cerrar}
              disabled={guardando}
              style={({ pressed }) => [
                styles.closeButton,
                pressed &&
                  !guardando &&
                  styles.closeButtonPressed,
              ]}
            >
              <Ionicons
                name="close"
                size={23}
                color={colors.brandDark}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios'
                ? 'interactive'
                : 'on-drag'
            }
            automaticallyAdjustKeyboardInsets={
              Platform.OS === 'ios'
            }
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>
                  Nombre
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ej. Aplicación de inventario"
                  placeholderTextColor="#8A918B"
                  value={formulario.nombre}
                  onChangeText={(valor) =>
                    actualizarCampo(
                      'nombre',
                      valor
                    )
                  }
                  autoCorrect={false}
                  returnKeyType="next"
                  maxLength={100}
                  editable={!guardando}
                />
              </View>

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    Descripción
                  </Text>

                  <Text style={styles.optional}>
                    Opcional
                  </Text>
                </View>

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  placeholder="Objetivo y alcance del proyecto"
                  placeholderTextColor="#8A918B"
                  value={formulario.descripcion}
                  onChangeText={(valor) =>
                    actualizarCampo(
                      'descripcion',
                      valor
                    )
                  }
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                  editable={!guardando}
                />

                <Text style={styles.counter}>
                  {formulario.descripcion.length}/500
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Fecha de término
                </Text>

                <CampoFecha
                  accessibilityLabel="Fecha de término"
                  editable={!guardando}
                  valor={formulario.fechaFin}
                  onChange={(valor) =>
                    actualizarCampo(
                      'fechaFin',
                      valor
                    )
                  }
                />

                <Text style={styles.helper}>
                  Ej. 15-12-2026
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Estado
                </Text>

                <View style={styles.estados}>
                  {ESTADOS_PROYECTO.map(
                    (estado) => {
                      const seleccionado =
                        formulario.estado ===
                        estado
                      const colorEstado = ESTADO_PROYECTO_COLORS[estado]

                      return (
                        <Pressable
                          key={estado}
                          disabled={guardando}
                          onPress={() =>
                            actualizarCampo(
                              'estado',
                              estado
                            )
                          }
                          style={({ pressed }) => [
                            styles.estadoButton,

                            seleccionado && {
                              borderColor: colorEstado.color,
                              backgroundColor: colorEstado.color,
                            },

                            pressed &&
                              !guardando &&
                              styles.estadoButtonPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.estadoText,

                              seleccionado &&
                                styles.estadoTextActivo,
                            ]}
                          >
                            {estado}
                          </Text>
                        </Pressable>
                      )
                    }
                  )}
                </View>
              </View>

              {error ? (
                <View
                  style={styles.errorContainer}
                  accessibilityRole="alert"
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={colors.danger}
                  />

                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              disabled={guardando}
              onPress={cerrar}
              style={({ pressed }) => [
                styles.secondaryButton,

                pressed &&
                  !guardando &&
                  styles.secondaryButtonPressed,
              ]}
            >
              <Text
                style={styles.secondaryButtonText}
              >
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              disabled={guardando}
              onPress={() => {
                void guardar()
              }}
              style={({ pressed }) => [
                styles.primaryButton,

                pressed &&
                  !guardando &&
                  styles.primaryButtonPressed,

                guardando &&
                  styles.buttonDisabled,
              ]}
            >
              {guardando ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Guardar cambios
                  </Text>
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
    paddingTop: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },

  headerText: {
    flex: 1,
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

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 28,
    paddingBottom: 24,
  },

  form: {
    gap: 22,
  },

  field: {
    gap: 8,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    color: colors.brandDark,
    fontSize: 15,
    fontWeight: '600',
  },

  optional: {
    color: '#747C76',
    fontSize: 13,
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

  textArea: {
    minHeight: 112,
  },

  counter: {
    color: '#747C76',
    fontSize: 12,
    textAlign: 'right',
  },

  helper: {
    color: '#747C76',
    fontSize: 12,
  },

  estados: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  estadoButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.surface,
  },

  estadoButtonPressed: {
    opacity: 0.75,
  },

  estadoText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },

  estadoTextActivo: {
    color: '#FFFFFF',
  },

  errorContainer: {
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
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
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
