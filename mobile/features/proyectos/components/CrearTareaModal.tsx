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

import { useFormularioTarea } from '../hooks/useCrearTarea'
import { CampoFecha } from './CampoFecha'

import { ESTADOS_TAREA } from '../types'
import type { EstadoTarea, Tarea } from '../types'

type Props = {
  visible: boolean
  listaId: string
  listaNombre: string
  siguienteOrden: number
  tarea?: Tarea | null
  onClose: () => void
  onSaved: () => Promise<void>
}

const ETIQUETAS_ESTADO: Record<EstadoTarea, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
}

export function TareaModal({
  visible,
  listaId,
  listaNombre,
  siguienteOrden,
  tarea,
  onClose,
  onSaved,
}: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const {
    nombre,
    descripcion,
    estado,
    fechaInicio,
    fechaEntrega,
    guardando,
    error,
    setNombre,
    setDescripcion,
    setEstado,
    setFechaInicio,
    setFechaEntrega,
    limpiarError,
    reiniciar,
    guardar,
  } = useFormularioTarea(tarea)

  function cerrar() {
    if (!guardando) {
      reiniciar()
      onClose()
    }
  }

  async function guardarCambios() {
    const guardada = await guardar(listaId, siguienteOrden)

    if (guardada) {
      onClose()
      await onSaved()
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
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {tarea ? 'Editar tarea' : 'Nueva tarea'}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                Lista: {listaNombre}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              disabled={guardando}
              hitSlop={8}
              onPress={cerrar}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={23} color={colors.brandDark} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                autoFocus
                autoCorrect={false}
                editable={!guardando}
                maxLength={120}
                placeholder="Ej. Diseñar pantalla de acceso"
                placeholderTextColor="#8A918B"
                style={styles.input}
                value={nombre}
                onChangeText={(valor) => {
                  setNombre(valor)
                  limpiarError()
                }}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Descripción</Text>
                <Text style={styles.optional}>Opcional</Text>
              </View>
              <TextInput
                editable={!guardando}
                maxLength={500}
                multiline
                numberOfLines={4}
                placeholder="Detalles necesarios para completar la tarea"
                placeholderTextColor="#8A918B"
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                value={descripcion}
                onChangeText={(valor) => {
                  setDescripcion(valor)
                  limpiarError()
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Estado</Text>
              <View style={styles.segmentedControl}>
                {ESTADOS_TAREA.map((opcion) => {
                  const seleccionada = estado === opcion

                  return (
                    <Pressable
                      key={opcion}
                      accessibilityRole="button"
                      accessibilityState={{ selected: seleccionada }}
                      disabled={guardando}
                      onPress={() => setEstado(opcion)}
                      style={[
                        styles.segment,
                        seleccionada && styles.segmentSelected,
                      ]}
                    >
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.segmentText,
                          seleccionada && styles.segmentTextSelected,
                        ]}
                      >
                        {ETIQUETAS_ESTADO[opcion]}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Fecha de inicio</Text>
              <CampoFecha
                accessibilityLabel="Fecha de inicio"
                editable={!guardando}
                valor={fechaInicio}
                onChange={(valor) => {
                  setFechaInicio(valor)
                  limpiarError()
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Fecha de entrega</Text>
              <CampoFecha
                accessibilityLabel="Fecha de entrega"
                editable={!guardando}
                valor={fechaEntrega}
                onChange={(valor) => {
                  setFechaEntrega(valor)
                  limpiarError()
                }}
              />
            </View>

            {error ? (
              <View style={styles.error} accessibilityRole="alert">
                <Ionicons name="alert-circle-outline" size={19} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={cerrar}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={guardando}
              onPress={() => void guardarCambios()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !guardando && styles.primaryButtonPressed,
                guardando && styles.disabled,
              ]}
            >
              {guardando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={tarea ? 'save-outline' : 'add'}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.primaryText}>
                    {tarea ? 'Guardar cambios' : 'Crear tarea'}
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
  safeArea: { flex: 1, backgroundColor: colors.background },
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
  title: { color: colors.text, fontSize: 23, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  form: { gap: 22, paddingTop: 30, paddingBottom: 24 },
  field: { gap: 8 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { color: colors.brandDark, fontSize: 15, fontWeight: '600' },
  optional: { color: '#747C76', fontSize: 12 },
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
  textArea: { minHeight: 100 },
  segmentedControl: {
    minHeight: 48,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 3,
    backgroundColor: colors.surface,
  },
  segment: {
    minWidth: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  segmentSelected: { backgroundColor: colors.brandSoft },
  segmentText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  segmentTextSelected: { color: colors.brand, fontWeight: '700' },
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
  errorText: { flex: 1, color: '#912018', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 14 },
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
  secondaryText: { color: colors.brandDark, fontSize: 15, fontWeight: '600' },
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
  primaryButtonPressed: { backgroundColor: colors.accentPressed },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.65 },
})
}
