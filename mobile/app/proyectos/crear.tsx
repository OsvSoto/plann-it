import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
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

import { useCrearProyecto } from '../../features/proyectos/hooks/useCrearProyecto'
import { CampoFecha } from '../../features/proyectos/components/CampoFecha'

export default function CrearProyectoScreen() {
  const {
    formulario,
    guardando,
    error,
    actualizarCampo,
    guardarProyecto,
  } = useCrearProyecto()

  async function crear() {
    const proyectoCreado = await guardarProyecto()

    if (proyectoCreado) {
      router.back()
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.intro}>
              <View style={styles.iconContainer}>
                <Ionicons name="folder-open-outline" size={24} color="#6F45A5" />
              </View>
              <View style={styles.introText}>
                <Text style={styles.title}>Información general</Text>
                <Text style={styles.subtitle}>Datos principales del proyecto</Text>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Aplicacion de inventario"
                  placeholderTextColor="#8A918B"
                  value={formulario.nombre}
                  onChangeText={(valor) => actualizarCampo('nombre', valor)}
                  autoFocus
                  autoCorrect={false}
                  returnKeyType="next"
                  maxLength={100}
                  editable={!guardando}
                />
              </View>

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Descripción</Text>
                  <Text style={styles.optional}>Opcional</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Objetivo y alcance del proyecto"
                  placeholderTextColor="#8A918B"
                  value={formulario.descripcion}
                  onChangeText={(valor) => actualizarCampo('descripcion', valor)}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                  editable={!guardando}
                />
                <Text style={styles.counter}>{formulario.descripcion.length}/500</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Fecha de término</Text>
                <CampoFecha
                  accessibilityLabel="Fecha de término"
                  editable={!guardando}
                  valor={formulario.fechaFin}
                  onChange={(valor) => actualizarCampo('fechaFin', valor)}
                />
                <Text style={styles.helper}>Ej. 15-12-2026</Text>
              </View>

              {error ? (
                <View style={styles.errorContainer} accessibilityRole="alert">
                  <Ionicons name="alert-circle-outline" size={20} color="#B42318" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && !guardando && styles.buttonPressed,
                guardando && styles.buttonDisabled,
              ]}
              onPress={crear}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add" size={21} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Crear proyecto</Text>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    gap: 28,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9E1F3',
  },
  introText: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: '#342247',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#766682',
    fontSize: 15,
    lineHeight: 21,
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
    color: '#4F2D7F',
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
    borderColor: '#D9CEE8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#342247',
    backgroundColor: '#FFFFFF',
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D92D20',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FEF3F2',
  },
  errorText: {
    flex: 1,
    color: '#912018',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FF6B2C',
  },
  buttonPressed: {
    backgroundColor: '#E8521D',
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})
