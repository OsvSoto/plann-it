import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useEditarTareaGantt } from '../../../features/carta-gantt/hooks/useEditarTareaGantt'
import { CampoFecha } from '../../../features/proyectos/components/CampoFecha'
import type { EstadoTarea } from '../../../features/proyectos/types'
import { ESTADOS_TAREA } from '../../../features/proyectos/types'

const ETIQUETAS_ESTADO: Record<EstadoTarea, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
}

export default function EditarTareaScreen() {
  const { id, proyectoId } = useLocalSearchParams<{ id: string; proyectoId: string }>()
  
  const {
    nombre,
    descripcion,
    estado,
    fechaInicio,
    fechaFin,
    miembros,
    miembroSeleccionado,
    cargando,
    guardando,
    error,
    setNombre,
    setDescripcion,
    setEstado,
    setFechaInicio,
    setFechaFin,
    setMiembroSeleccionado,
    limpiarError,
    guardar,
  } = useEditarTareaGantt(id, proyectoId)

  async function guardarCambios() {
    const guardada = await guardar()
    if (guardada) {
      router.back()
    }
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="arrow-back" size={24} color="#342247" />
          </Pressable>
          <Text style={styles.headerTitle}>Editar tarea</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#6F45A5" />
        </View>
      </SafeAreaView>
    )
  }

  if (error && !nombre) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="arrow-back" size={24} color="#342247" />
          </Pressable>
          <Text style={styles.headerTitle}>Editar tarea</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={42} color="#B42318" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          disabled={guardando}
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#342247" />
        </Pressable>
        <Text style={styles.headerTitle}>Editar tarea</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                autoFocus
                autoCorrect={false}
                editable={!guardando}
                maxLength={120}
                placeholder="Ej. Dise ar pantalla de acceso"
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
                <Text style={styles.label}>Descripci n</Text>
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
              <Text style={styles.label}>Responsable</Text>
              <View style={styles.miembrosContainer}>
                <Pressable
                  onPress={() => {
                    setMiembroSeleccionado(null)
                    limpiarError()
                  }}
                  style={[styles.miembroPill, miembroSeleccionado === null && styles.miembroPillSelected]}
                >
                  <Text style={[styles.miembroPillText, miembroSeleccionado === null && styles.miembroPillTextSelected]}>
                    Sin asignar
                  </Text>
                </Pressable>
                
                {miembros.map((miembro) => {
                  const seleccionado = miembroSeleccionado === miembro.miembro_proyecto_id
                  return (
                    <Pressable
                      key={miembro.miembro_proyecto_id}
                      onPress={() => {
                        setMiembroSeleccionado(miembro.miembro_proyecto_id)
                        limpiarError()
                      }}
                      style={[styles.miembroPill, seleccionado && styles.miembroPillSelected]}
                    >
                      <Text style={[styles.miembroPillText, seleccionado && styles.miembroPillTextSelected]}>
                        {miembro.usuario_nombre}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
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

            <View style={styles.fieldRow}>
              <View style={[styles.field, { flex: 1 }]}>
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
              
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Fecha de t rmino</Text>
                <CampoFecha
                  accessibilityLabel="Fecha de t rmino"
                  editable={!guardando}
                  valor={fechaFin}
                  onChange={(valor) => {
                    setFechaFin(valor)
                    limpiarError()
                  }}
                />
              </View>
            </View>

            {error ? (
              <View style={styles.error} accessibilityRole="alert">
                <Ionicons name="alert-circle-outline" size={19} color="#B42318" />
                <Text style={styles.errorAlertText}>{error}</Text>
              </View>
            ) : null}

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
                  <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryText}>Guardar cambios</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F5FB',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CEE8',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonPressed: {
    backgroundColor: '#E9E1F3',
  },
  headerTitle: {
    color: '#342247',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 24,
  },
  errorText: {
    color: '#766682',
    textAlign: 'center',
    fontSize: 16,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  form: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  field: {
    gap: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#4F2D7F',
    fontSize: 15,
    fontWeight: '600',
  },
  optional: {
    color: '#747C76',
    fontSize: 12,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#342247',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  miembrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  miembroPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F0EAF6',
    borderWidth: 1,
    borderColor: '#D9CEE8',
  },
  miembroPillSelected: {
    backgroundColor: '#6F45A5',
    borderColor: '#4F2D7F',
  },
  miembroPillText: {
    color: '#4F2D7F',
    fontSize: 13,
    fontWeight: '600',
  },
  miembroPillTextSelected: {
    color: '#FFFFFF',
  },
  segmentedControl: {
    minHeight: 48,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    padding: 3,
    backgroundColor: '#FFFFFF',
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
  segmentSelected: {
    backgroundColor: '#E9E1F3',
  },
  segmentText: {
    color: '#766682',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  segmentTextSelected: {
    color: '#6F45A5',
    fontWeight: '700',
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D92D20',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FEF3F2',
  },
  errorAlertText: {
    flex: 1,
    color: '#912018',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 8,
    backgroundColor: '#FF6B2C',
    marginTop: 10,
  },
  primaryButtonPressed: {
    backgroundColor: '#E8521D',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.65,
  },
})