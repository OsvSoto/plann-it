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

import { useCrearLista } from '../hooks/useCrearLista'

type Props = {
  visible: boolean
  tableroId: string
  siguienteOrden: number
  onClose: () => void
  onCreated: () => Promise<void>
}

export function CrearListaModal({
  visible,
  tableroId,
  siguienteOrden,
  onClose,
  onCreated,
}: Props) {
  const {
    nombre,
    guardando,
    error,
    actualizarNombre,
    reiniciar,
    guardar,
  } = useCrearLista()

  function cerrar() {
    if (!guardando) {
      reiniciar()
      onClose()
    }
  }

  async function crear() {
    const creada = await guardar(tableroId, siguienteOrden)

    if (creada) {
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
            <View style={styles.headerText}>
              <Text style={styles.title}>Nueva lista</Text>
              <Text style={styles.subtitle}>Agrega una etapa al tablero</Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              disabled={guardando}
              hitSlop={8}
              onPress={cerrar}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Ionicons name="close" size={23} color="#4F2D7F" />
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                autoFocus
                autoCorrect={false}
                editable={!guardando}
                maxLength={80}
                placeholder="Ej. Pendientes"
                placeholderTextColor="#8A918B"
                returnKeyType="done"
                style={styles.input}
                value={nombre}
                onChangeText={actualizarNombre}
                onSubmitEditing={() => void crear()}
              />
            </View>

            {error ? (
              <View style={styles.error} accessibilityRole="alert">
                <Ionicons name="alert-circle-outline" size={19} color="#B42318" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={cerrar}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={guardando}
              onPress={() => void crear()}
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
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryText}>Crear lista</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F5FB' },
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
    gap: 16,
  },
  headerText: { flex: 1, gap: 4 },
  title: { color: '#342247', fontSize: 23, fontWeight: '700' },
  subtitle: { color: '#766682', fontSize: 14 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconButtonPressed: { backgroundColor: '#E8ECE9' },
  form: { flex: 1, paddingTop: 34, gap: 18 },
  field: { gap: 8 },
  label: { color: '#4F2D7F', fontSize: 15, fontWeight: '600' },
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
  errorText: { flex: 1, color: '#912018', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, paddingTop: 16 },
  secondaryButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  secondaryText: { color: '#4F2D7F', fontSize: 15, fontWeight: '600' },
  primaryButton: {
    minHeight: 48,
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 8,
    backgroundColor: '#FF6B2C',
  },
  primaryButtonPressed: { backgroundColor: '#E8521D' },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.65 },
})
