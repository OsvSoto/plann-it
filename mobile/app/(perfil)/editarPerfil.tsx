import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  Image,
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

import { useAppColors } from '../../hooks/use-app-colors'
import type { AppColorsShape } from '../../constants/theme'
import { useEditarPerfil } from '../../features/perfil/hooks/useEditarPerfil'

function obtenerMensajeError(error: unknown, alternativo: string) {
  return error instanceof Error && error.message
    ? error.message
    : alternativo
}

export default function EditarPerfilScreen() {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const {
    nombre,
    setNombre,
    correo,
    biografia,
    setBiografia,
    fotoUri,
    cargando,
    guardando,
    error,
    seleccionarFoto,
    guardarPerfil,
  } = useEditarPerfil()

  async function elegirFoto() {
    try {
      await seleccionarFoto()
    } catch (error) {
      Alert.alert(
        'No fue posible seleccionar la foto',
        obtenerMensajeError(error, 'Intenta nuevamente.')
      )
    }
  }

  async function guardar() {
    try {
      await guardarPerfil()
      Alert.alert('Perfil actualizado', 'Tus cambios fueron guardados.')
      router.back()
    } catch (error) {
      Alert.alert(
        'No fue posible guardar el perfil',
        obtenerMensajeError(error, 'Intenta nuevamente.')
      )
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Volver al perfil"
          accessibilityRole="button"
          disabled={guardando}
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentContainerStyle={styles.content}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <View style={styles.avatarSection}>
                <Pressable
                  accessibilityLabel="Seleccionar foto de perfil"
                  accessibilityRole="button"
                  onPress={() => void elegirFoto()}
                  style={({ pressed }) => [
                    styles.avatarFrame,
                    pressed && styles.avatarPressed,
                  ]}
                >
                  {fotoUri ? (
                    <Image source={{ uri: fotoUri }} style={styles.avatar} />
                  ) : (
                    <Ionicons name="person" size={58} color={colors.brand} />
                  )}
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={17} color={colors.surface} />
                  </View>
                </Pressable>
                <Pressable onPress={() => void elegirFoto()}>
                  <Text style={styles.changePhotoText}>Cambiar foto</Text>
                </Pressable>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Nombre de usuario</Text>
                <TextInput
                  accessibilityLabel="Nombre de usuario"
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect={false}
                  maxLength={80}
                  onChangeText={setNombre}
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={nombre}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  accessibilityLabel="Correo electrónico"
                  editable={false}
                  style={[styles.input, styles.inputDisabled]}
                  value={correo}
                />
                <Text style={styles.helperText}>
                  El correo de acceso no se modifica desde el perfil.
                </Text>
              </View>

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Biografía</Text>
                  <Text style={styles.characterCount}>{biografia.length}/250</Text>
                </View>
                <TextInput
                  accessibilityLabel="Biografía"
                  maxLength={250}
                  multiline
                  numberOfLines={5}
                  onChangeText={setBiografia}
                  placeholder="Cuéntale algo sobre ti al equipo"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={biografia}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                accessibilityRole="button"
                disabled={guardando}
                onPress={() => void guardar()}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                  guardando && styles.buttonDisabled,
                ]}
              >
                {guardando ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonPressed: {
    backgroundColor: colors.brandSoft,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  avatarFrame: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.brand,
    borderRadius: 52,
    backgroundColor: colors.brandSoft,
  },
  avatarPressed: {
    opacity: 0.82,
  },
  avatar: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 49,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 16,
    backgroundColor: colors.brand,
  },
  changePhotoText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
  field: {
    gap: 7,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: '600',
  },
  characterCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 16,
  },
  inputDisabled: {
    color: colors.textMuted,
    backgroundColor: colors.background,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  textArea: {
    minHeight: 112,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  saveButtonPressed: {
    backgroundColor: colors.accentPressed,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
})
}
