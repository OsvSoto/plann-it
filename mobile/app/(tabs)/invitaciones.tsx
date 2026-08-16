import { useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { InvitacionCard } from '../../features/invitaciones/components/InvitacionCard'
import { useInvitaciones } from '../../features/invitaciones/hooks/useInvitaciones'
import { useAppColors } from '../../hooks/use-app-colors'
import type { AppColorsShape } from '../../constants/theme'

import type {
  InvitacionPendiente,
  RespuestaInvitacion,
} from '../../features/invitaciones/types'

export default function InvitacionesScreen() {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const {
    invitaciones,
    cargando,
    procesando,
    error,
    cargarInvitaciones,
    responder,
  } = useInvitaciones()

  useFocusEffect(
    useCallback(() => {
      void cargarInvitaciones()
    }, [cargarInvitaciones])
  )

  async function ejecutarRespuesta(
    invitacion: InvitacionPendiente,
    respuesta: RespuestaInvitacion
  ) {
    const proyectoId = await responder(invitacion.invitacion_id, respuesta)

    if (!proyectoId) {
      return
    }

    if (respuesta === 'ACEPTADA') {
      Alert.alert(
        'Ya eres parte del proyecto',
        `Ahora puedes encontrar "${invitacion.proyecto_nombre}" en Mis proyectos.`
      )
    }
  }

  function confirmarRechazo(invitacion: InvitacionPendiente) {
    Alert.alert(
      'Rechazar invitación',
      `¿Quieres rechazar la invitación a "${invitacion.proyecto_nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => void ejecutarRespuesta(invitacion, 'RECHAZADA'),
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>COLABORACIÓN</Text>
        <Text style={styles.title}>Invitaciones</Text>
        <Text style={styles.subtitle}>
          Proyectos en los que puedes participar.
        </Text>
      </View>

      {cargando && invitaciones.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.stateText}>Cargando invitaciones...</Text>
        </View>
      ) : error && invitaciones.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
          </View>
          <Text style={styles.stateTitle}>No pudimos cargar tus invitaciones</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable
            onPress={() => void cargarInvitaciones()}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : invitaciones.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="mail-open-outline" size={31} color={colors.brand} />
          </View>
          <Text style={styles.stateTitle}>No tienes invitaciones pendientes</Text>
          <Text style={styles.stateText}>
            Cuando un líder te invite a su proyecto aparecerá aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          data={invitaciones}
          keyExtractor={(invitacion) => invitacion.invitacion_id}
          renderItem={({ item }) => (
            <InvitacionCard
              invitacion={item}
              procesando={procesando === item.invitacion_id}
              deshabilitada={procesando !== null}
              onAccept={() => void ejecutarRespuesta(item, 'ACEPTADA')}
              onReject={() => confirmarRechazo(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={cargando}
          onRefresh={cargarInvitaciones}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 16,
      gap: 4,
    },
    eyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
    title: { color: colors.text, fontSize: 28, fontWeight: '700' },
    subtitle: { color: colors.textMuted, fontSize: 14 },
    centerState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingHorizontal: 32,
      paddingBottom: 80,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      marginBottom: 5,
      backgroundColor: colors.brandSoft,
    },
    errorIcon: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      marginBottom: 4,
      backgroundColor: colors.dangerSoft,
    },
    stateTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
    },
    stateText: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    retryButton: {
      minHeight: 42,
      justifyContent: 'center',
      marginTop: 8,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    retryText: { color: colors.brandDark, fontWeight: '600' },
    list: {
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
      paddingHorizontal: 20,
      paddingTop: 6,
      paddingBottom: 28,
    },
    separator: { height: 12 },
  })
}
