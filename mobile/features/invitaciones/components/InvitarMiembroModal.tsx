import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Alert,
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

import { useInvitarMiembro } from '../hooks/useInvitarMiembro'

type Props = {
  visible: boolean
  proyectoId: string
  proyectoNombre: string
  onClose: () => void
}

export function InvitarMiembroModal({
  visible,
  proyectoId,
  proyectoNombre,
  onClose,
}: Props) {
  const [correo, setCorreo] = useState('')
  const {
    enviando,
    error,
    limpiarError,
    invitar,
  } = useInvitarMiembro()

  function cerrar() {
    if (!enviando) {
      setCorreo('')
      limpiarError()
      onClose()
    }
  }

  async function enviar() {
    const enviada = await invitar(proyectoId, correo)

    if (enviada) {
      setCorreo('')
      onClose()
      Alert.alert(
        'Invitación enviada',
        'La persona podrá aceptar o rechazar desde su cuenta.'
      )
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
              <Text style={styles.title}>Invitar al proyecto</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {proyectoNombre}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              disabled={enviando}
              hitSlop={8}
              onPress={cerrar}
              style={styles.iconButton}
            >
              <Ionicons name="close" size={23} color="#4F2D7F" />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.info}>
              <Ionicons name="information-circle-outline" size={21} color="#6F45A5" />
              <Text style={styles.infoText}>
                Usa el correo exacto de una persona que ya tenga una cuenta en Plann-It.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                editable={!enviando}
                keyboardType="email-address"
                placeholder="persona@correo.com"
                placeholderTextColor="#8A918B"
                value={correo}
                onChangeText={(valor) => {
                  setCorreo(valor)
                  limpiarError()
                }}
                onSubmitEditing={() => void enviar()}
                style={styles.input}
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
            <Pressable
              disabled={enviando}
              onPress={cerrar}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={enviando}
              onPress={() => void enviar()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !enviando && styles.primaryButtonPressed,
                enviando && styles.disabled,
              ]}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryText}>Enviar invitación</Text>
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
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
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
  content: { flex: 1, gap: 22, paddingTop: 30 },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F0EAF6',
  },
  infoText: { flex: 1, color: '#5D4D68', fontSize: 13, lineHeight: 19 },
  field: { gap: 8 },
  label: { color: '#4F2D7F', fontSize: 15, fontWeight: '600' },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    paddingHorizontal: 14,
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
  actions: { flexDirection: 'row', gap: 10, paddingTop: 14 },
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
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 8,
    backgroundColor: '#FF6B2C',
  },
  primaryButtonPressed: { backgroundColor: '#E8521D' },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.65 },
})
