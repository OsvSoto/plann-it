import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppColors } from '../../constants/theme'
import { usePerfil } from '../../features/perfil/hooks/usePerfil'

export default function PerfilScreen() {
  const {
    perfil,
    cargando,
    error,
    cargarPerfil,
  } = usePerfil()

  function volver() {
    if (router.canGoBack()) {
      router.back()
      return
    }

    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={8}
          onPress={volver}
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={AppColors.brand} />
        </View>
      ) : error || !perfil ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={42} color={AppColors.danger} />
          <Text style={styles.errorText}>{error ?? 'Perfil no disponible.'}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void cargarPerfil()}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.avatarFrame}>
              {perfil.fotoUrl ? (
                <Image source={{ uri: perfil.fotoUrl }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={64} color={AppColors.brand} />
              )}
            </View>

            <Text style={styles.name}>{perfil.nombre}</Text>
            <Text style={styles.email}>{perfil.correo}</Text>

            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>Sobre mí</Text>
              <Text style={styles.bioText}>
                {perfil.biografia || 'Aún no has agregado una biografía.'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/editarPerfil')}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Ionicons name="create-outline" size={19} color={AppColors.surface} />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    backgroundColor: AppColors.surface,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonPressed: {
    backgroundColor: AppColors.brandSoft,
  },
  headerTitle: {
    color: AppColors.text,
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
    gap: 14,
    padding: 24,
  },
  errorText: {
    color: AppColors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: AppColors.brand,
  },
  retryButtonText: {
    color: AppColors.surface,
    fontWeight: '700',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
  },
  avatarFrame: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: AppColors.brand,
    borderRadius: 56,
    backgroundColor: AppColors.brandSoft,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    marginTop: 16,
    color: AppColors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  email: {
    marginTop: 4,
    color: AppColors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  bioContainer: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: AppColors.brandSoft,
  },
  bioTitle: {
    marginBottom: 8,
    color: AppColors.brandDark,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bioText: {
    color: AppColors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  editButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    padding: 14,
    borderRadius: 8,
    backgroundColor: AppColors.accent,
  },
  primaryButtonPressed: {
    opacity: 0.82,
  },
  editButtonText: {
    color: AppColors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
})
