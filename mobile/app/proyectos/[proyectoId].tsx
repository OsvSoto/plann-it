import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAppColors } from '../../hooks/use-app-colors'
import type { AppColorsShape } from '../../constants/theme'
import { EquipoProyecto } from '../../features/invitaciones/components/EquipoProyecto'
import { ESTADO_PROYECTO_COLORS } from '../../features/proyectos/types'
import type { EstadoProyecto } from '../../features/proyectos/types'
import { CrearTableroModal } from '../../features/proyectos/components/CrearTableroModal'
import { EditarProyectoModal } from '../../features/proyectos/components/EditarProyectoModal'
import { TableroCard } from '../../features/proyectos/components/TableroCard'
import { useDetalleProyecto } from '../../features/proyectos/hooks/useDetalleProyecto'
import { useEliminarRecursosProyecto } from '../../features/proyectos/hooks/useEliminarRecursosProyecto'

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(anio, mes - 1, dia))
}

export default function DetalleProyectoScreen() {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const { proyectoId } = useLocalSearchParams<{
    proyectoId: string
  }>()

  const [creandoTablero, setCreandoTablero] = useState(false)
  const [editandoProyecto, setEditandoProyecto] = useState(false)

  const {
    eliminando,
    eliminarProyecto,
  } = useEliminarRecursosProyecto()

  const {
    detalle,
    cargando,
    error,
    cargarDetalle,
  } = useDetalleProyecto(proyectoId)

  if (cargando && !detalle) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['right', 'bottom', 'left']}
      >
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={colors.brand}
          />

          <Text style={styles.stateText}>
            Cargando proyecto...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error && !detalle) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['right', 'bottom', 'left']}
      >
        <View style={styles.centerState}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={colors.danger}
            />
          </View>

          <Text style={styles.stateTitle}>
            No pudimos abrir el proyecto
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={cargarDetalle}
          >
            <Text style={styles.retryText}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  if (!detalle) {
    return null
  }

  const {
    proyecto,
    tableros,
    esLider,
    puedeEliminarProyecto,
  } = detalle

  async function ejecutarEliminacionProyecto() {
    const eliminado = await eliminarProyecto(
      proyecto.proyecto_id
    )

    if (eliminado) {
      router.replace('/(tabs)/proyectos')
      return
    }

    Alert.alert(
      'No fue posible eliminar el proyecto',
      'Intenta nuevamente.'
    )
  }

  function solicitarEliminacionProyecto() {
    if (!puedeEliminarProyecto) {
      Alert.alert(
        'No puedes eliminar este proyecto',
        'Primero deben salir todos los demás miembros. El líder debe ser el único miembro del proyecto.'
      )

      return
    }

    Alert.alert(
      'Eliminar proyecto',
      'Se eliminarán definitivamente sus tableros, listas, tareas, asignaciones y demás información asociada.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar proyecto',
          style: 'destructive',
          onPress: () =>
            void ejecutarEliminacionProyecto(),
        },
      ]
    )
  }

  function abrirTablero(tableroId: string) {
    router.push({
      pathname:
        '/proyectos/[proyectoId]/tableros/[tableroId]',
      params: {
        proyectoId:
          proyecto.proyecto_id,
        tableroId,
      },
    })
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['right', 'bottom', 'left']}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={cargando}
            onRefresh={cargarDetalle}
            tintColor={colors.brand}
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.projectHeader}>
          <View style={styles.titleRow}>
            <View style={styles.projectIcon}>
              <Ionicons
                name="folder-open-outline"
                size={24}
                color={colors.brand}
              />
            </View>

            <View style={styles.titleContent}>
              <Text style={styles.projectName}>
                {proyecto.proyecto_nombre}
              </Text>

              <View
                style={[
                  styles.status,
                  { backgroundColor: ESTADO_PROYECTO_COLORS[proyecto.proyecto_estado as EstadoProyecto].background },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: ESTADO_PROYECTO_COLORS[proyecto.proyecto_estado as EstadoProyecto].color },
                  ]}
                >
                  {proyecto.proyecto_estado}
                </Text>
              </View>
            </View>

            {esLider ? (
              <View style={styles.projectActions}>
                <Pressable
                  accessibilityLabel="Editar proyecto"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() =>
                    setEditandoProyecto(true)
                  }
                  style={({ pressed }) => [
                    styles.editProjectButton,
                    pressed &&
                      styles.editProjectButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={21}
                    color={colors.brand}
                  />
                </Pressable>

                <Pressable
                  accessibilityLabel="Eliminar proyecto"
                  accessibilityRole="button"
                  disabled={
                    eliminando ===
                    proyecto.proyecto_id
                  }
                  hitSlop={8}
                  onPress={
                    solicitarEliminacionProyecto
                  }
                  style={({ pressed }) => [
                    styles.deleteProjectButton,
                    pressed &&
                      styles.deleteProjectButtonPressed,
                  ]}
                >
                  {eliminando ===
                  proyecto.proyecto_id ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.accentStrong}
                    />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={21}
                      color={colors.accentStrong}
                    />
                  )}
                </Pressable>
              </View>
            ) : null}
          </View>

          {proyecto.proyecto_descripcion ? (
            <Text style={styles.description}>
              {
                proyecto.proyecto_descripcion
              }
            </Text>
          ) : null}

          <View style={styles.dates}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>
                Inicio
              </Text>

              <Text style={styles.dateValue}>
                {formatearFecha(
                  proyecto.proyecto_fecha_inicio
                )}
              </Text>
            </View>

            <View style={styles.dateDivider} />

            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>
                Término
              </Text>

              <Text style={styles.dateValue}>
                {formatearFecha(
                  proyecto.proyecto_fecha_fin
                )}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/carta-gantt/${proyecto.proyecto_id}`)}
            style={({ pressed }) => [
              styles.ganttButton,
              pressed && styles.ganttButtonPressed,
            ]}
          >
            <Ionicons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.ganttButtonText}>Ir a la Carta Gantt</Text>
          </Pressable>
        </View>

        <EquipoProyecto
          proyectoId={proyecto.proyecto_id}
          proyectoNombre={
            proyecto.proyecto_nombre
          }
          esLider={esLider}
        />

        <View style={styles.workspaceHeader}>
          <View style={styles.workspaceText}>
            <Text style={styles.eyebrow}>
              ORGANIZACIÓN DEL TRABAJO
            </Text>

            <Text style={styles.workspaceTitle}>
              Tableros
            </Text>
          </View>

          {esLider ? (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                setCreandoTablero(true)
              }
              style={({ pressed }) => [
                styles.createBoardButton,
                pressed &&
                  styles.createBoardButtonPressed,
              ]}
            >
              <Ionicons
                name="add"
                size={19}
                color="#FFFFFF"
              />

              <Text
                style={styles.createBoardButtonText}
              >
                Nuevo tablero
              </Text>
            </Pressable>
          ) : null}
        </View>

        {tableros.length === 0 ? (
          <View style={styles.emptyWorkspace}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="grid-outline"
                size={30}
                color={colors.brand}
              />
            </View>

            <Text style={styles.stateTitle}>
              Proyecto sin tableros
            </Text>

            <Text style={styles.stateText}>
              Cuando se cree un tablero
              aparecerá en este espacio.
            </Text>
          </View>
        ) : (
          <View style={styles.boards}>
            {tableros.map((tablero) => (
              <TableroCard
                key={tablero.tablero_id}
                tablero={tablero}
                onPress={() =>
                  abrirTablero(
                    tablero.tablero_id
                  )
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      <EditarProyectoModal
        visible={editandoProyecto}
        proyecto={proyecto}
        onCerrar={() =>
          setEditandoProyecto(false)
        }
        onGuardado={cargarDetalle}
      />

      <CrearTableroModal
        visible={creandoTablero}
        proyectoId={proyecto.proyecto_id}
        onClose={() =>
          setCreandoTablero(false)
        }
        onCreated={cargarDetalle}
      />
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
    paddingTop: 20,
    paddingBottom: 36,
    gap: 30,
  },

  projectHeader: {
    marginHorizontal: 20,
    gap: 18,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },

  projectIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.brandSoft,
  },

  titleContent: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 8,
  },

  projectName: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 31,
  },

  status: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.accentSoft,
  },

  statusText: {
    color: colors.accentPressed,
    fontSize: 11,
    fontWeight: '700',
  },

  projectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  editProjectButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  editProjectButtonPressed: {
    backgroundColor: '#F0EAF6',
  },

  deleteProjectButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  deleteProjectButtonPressed: {
    backgroundColor: colors.accentStrongSoft,
  },

  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },

  dates: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
  },

  dateItem: {
    flex: 1,
    gap: 4,
  },

  dateDivider: {
    width: 1,
    marginHorizontal: 16,
    backgroundColor: colors.border,
  },

  dateLabel: {
    color: '#747C76',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  dateValue: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: '600',
  },

  ganttButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.brand,
  },
  ganttButtonPressed: {
    backgroundColor: colors.brandDark,
  },
  ganttButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingHorizontal: 20,
  },

  workspaceText: {
    flex: 1,
    gap: 4,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },

  workspaceTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },

  createBoardButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.accent,
  },

  createBoardButtonPressed: {
    backgroundColor: colors.accentPressed,
  },

  createBoardButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  boards: {
    gap: 18,
    paddingHorizontal: 20,
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

  emptyWorkspace: {
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 32,
    paddingVertical: 34,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 3,
    backgroundColor: colors.brandSoft,
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

  retryText: {
    color: colors.brandDark,
    fontWeight: '600',
  },
})
}
