import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
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
import type { AppColorsShape } from '../../../constants/theme'
import { useAppColors } from '../../../hooks/use-app-colors'
import { useInvitarMiembro } from '../hooks/useInvitarMiembro'
import type { UsuarioBusqueda } from '../types'

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
  const colors = useAppColors()
  const styles = createStyles(colors)

  const [busqueda, setBusqueda] = useState('')
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioBusqueda | null>(null)

  const {
    buscando,
    enviando,
    resultados,
    error,
    setResultados,
    limpiarError,
    buscar,
    invitar,
  } = useInvitarMiembro(proyectoId)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.trim().length >= 2) {
        void buscar(busqueda)
      } else {
        setResultados([])
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [busqueda])

  function cerrar() {
    if (!enviando) {
      setBusqueda('')
      setUsuarioSeleccionado(null)
      setResultados([])
      limpiarError()
      onClose()
    }
  }

  async function ejecutarInvitacion() {
    if (!usuarioSeleccionado) return
    const enviada = await invitar(usuarioSeleccionado.usuario_id)
    if (enviada) {
      setBusqueda('')
      setUsuarioSeleccionado(null)
      setResultados([])
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
              <Ionicons name="close" size={23} color={colors.brandDark} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Buscar usuario</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="search" size={20} color="#8A918B" style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  editable={!enviando}
                  placeholder="Buscar por nombre o correo..."
                  placeholderTextColor="#8A918B"
                  value={busqueda}
                  onChangeText={(val) => {
                    setBusqueda(val)
                    if (usuarioSeleccionado) setUsuarioSeleccionado(null)
                  }}
                  style={styles.input}
                />
                {buscando && <ActivityIndicator size="small" color={colors.brand} style={styles.loaderIcon} />}
              </View>
            </View>

            {error ? (
              <View style={styles.error} accessibilityRole="alert">
                <Ionicons name="alert-circle-outline" size={19} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <ScrollView 
              style={styles.resultsList} 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {resultados.map((user) => {
                const seleccionado = usuarioSeleccionado?.usuario_id === user.usuario_id
                return (
                  <Pressable
                    key={user.usuario_id}
                    onPress={() => setUsuarioSeleccionado(user)}
                    style={[styles.userItem, seleccionado && styles.userItemSelected]}
                  >
                    <View style={styles.avatar}>
                      {user.usuario_foto ? (
                        <Image source={{ uri: user.usuario_foto }} style={styles.avatarImg} />
                      ) : (
                        <Ionicons name="person" size={20} color={colors.brandDark} />
                      )}
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, seleccionado && styles.userTextSelected]}>{user.usuario_nombre}</Text>
                      <Text style={[styles.userEmail, seleccionado && styles.userTextSelected]}>{user.usuario_correo}</Text>
                    </View>
                    {seleccionado && <Ionicons name="checkmark-circle" size={24} color={colors.brand} />}
                  </Pressable>
                )
              })}
              {resultados.length === 0 && busqueda.length >= 2 && !buscando && !error && (
                <Text style={styles.emptyResults}>No se encontraron usuarios.</Text>
              )}
            </ScrollView>
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
              disabled={enviando || !usuarioSeleccionado}
              onPress={ejecutarInvitacion}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !enviando && styles.primaryButtonPressed,
                (enviando || !usuarioSeleccionado) && styles.disabled,
              ]}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryText} numberOfLines={1}>
                    {usuarioSeleccionado ? `Invitar a ${usuarioSeleccionado.usuario_nombre}` : 'Enviar invitación'}
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
    content: { flex: 1, gap: 16, paddingTop: 30 },
    field: { gap: 8 },
    label: { color: colors.brandDark, fontSize: 15, fontWeight: '600' },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
      minHeight: 50,
      paddingHorizontal: 14,
    },
    inputIcon: { marginRight: 8 },
    loaderIcon: { marginLeft: 8 },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      paddingVertical: 12,
    },
    resultsList: {
      flex: 1,
      marginTop: 8,
    },
    userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
      marginBottom: 10,
    },
    userItemSelected: {
      borderColor: colors.brand,
      backgroundColor: colors.brandSoft,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.brandSoft,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
    },
    userInfo: {
      flex: 1,
      marginLeft: 12,
    },
    userName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    userEmail: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    userTextSelected: {
      color: colors.brandDark,
    },
    emptyResults: {
      textAlign: 'center',
      color: colors.textMuted,
      marginTop: 20,
      fontSize: 15,
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
    errorText: { flex: 1, color: '#912018', fontSize: 14, lineHeight: 20 },
    actions: { flexDirection: 'row', gap: 10, paddingTop: 14 },
    secondaryButton: {
      minHeight: 48,
      flex: 0.8,
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
      flex: 1.5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      borderRadius: 8,
      backgroundColor: colors.accent,
      paddingHorizontal: 10,
    },
    primaryButtonPressed: { backgroundColor: colors.accentPressed },
    primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', flexShrink: 1 },
    disabled: { opacity: 0.65 },
  })
}