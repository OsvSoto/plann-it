import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppColors } from '../../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../../constants/theme'
import { TableroProyecto } from '../../../../features/proyectos/components/TableroProyecto'
import { useDetalleProyecto } from '../../../../features/proyectos/hooks/useDetalleProyecto'

export default function DetalleTableroScreen() {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const { proyectoId, tableroId } = useLocalSearchParams<{
    proyectoId: string
    tableroId: string
  }>()
  const {
    detalle,
    cargando,
    error,
    cargarDetalle,
  } = useDetalleProyecto(proyectoId)

  const tablero = detalle?.tableros.find(
    (tableroActual) => tableroActual.tablero_id === tableroId
  )

  if (cargando && !detalle) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={styles.stateText}>Preparando tablero...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error || !detalle || !tablero) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={30} color={colors.danger} />
          </View>
          <Text style={styles.stateTitle}>No pudimos abrir el tablero</Text>
          <Text style={styles.stateText}>
            {error ?? 'El tablero no existe o no pertenece a este proyecto.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={cargarDetalle}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const cantidadTareas = tablero.listas.reduce(
    (total, lista) => total + lista.tareas.length,
    0
  )

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
      <Stack.Screen options={{ title: tablero.tablero_nombre }} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            refreshing={cargando}
            onRefresh={cargarDetalle}
            tintColor={colors.brand}
          />
        )}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.projectReference}>
            <Ionicons name="folder-outline" size={15} color={colors.brand} />
            <Text style={styles.projectName} numberOfLines={1}>
              {detalle.proyecto.proyecto_nombre}
            </Text>
          </View>
          <Text style={styles.title}>{tablero.tablero_nombre}</Text>
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Ionicons name="albums-outline" size={16} color={colors.brand} />
              <Text style={styles.summaryText}>
                {tablero.listas.length} {tablero.listas.length === 1 ? 'lista' : 'listas'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="document-text-outline" size={16} color={colors.accent} />
              <Text style={styles.summaryText}>
                {cantidadTareas} {cantidadTareas === 1 ? 'tarea' : 'tareas'}
              </Text>
            </View>
          </View>
        </View>

        <TableroProyecto
          tablero={tablero}
          esLider={detalle.esLider}
          miUsuarioId={detalle.miUsuarioId}
          onChanged={cargarDetalle}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 18,
    paddingBottom: 28,
    gap: 20,
  },
  header: {
    gap: 10,
    paddingHorizontal: 20,
  },
  projectReference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectName: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    color: '#5D4D68',
    fontSize: 13,
    fontWeight: '600',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 58,
    height: 58,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
  },
  retryButtonPressed: {
    backgroundColor: '#F0EAF6',
  },
  retryText: {
    color: colors.brandDark,
    fontWeight: '600',
  },
})
}
