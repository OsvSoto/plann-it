import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import { useMiembrosProyecto } from '../hooks/useMiembrosProyecto'
import { AdministrarMiembroModal } from './AdministrarMiembroModal'
import { InvitarMiembroModal } from './InvitarMiembroModal'

import type { MiembroProyecto } from '../types'

type Props = {
  proyectoId: string
  proyectoNombre: string
  puedeGestionarMiembros: boolean
}

function inicial(nombre: string) {
  return nombre.trim().charAt(0).toUpperCase() || '?'
}

export function EquipoProyecto({
  proyectoId,
  proyectoNombre,
  puedeGestionarMiembros,
}: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const [invitando, setInvitando] = useState(false)
  const [miembroSeleccionado, setMiembroSeleccionado] = useState<MiembroProyecto | null>(null)
  const {
    miembros,
    usuarioActualId,
    cargando,
    error,
    cargarMiembros,
  } = useMiembrosProyecto(proyectoId)

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>COLABORACIÓN</Text>
          <Text style={styles.title}>Equipo</Text>
        </View>
        {puedeGestionarMiembros ? (
          <Pressable
            accessibilityLabel="Invitar miembro"
            accessibilityRole="button"
            onPress={() => setInvitando(true)}
            style={({ pressed }) => [
              styles.inviteButton,
              pressed && styles.inviteButtonPressed,
            ]}
          >
            <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
            <Text style={styles.inviteText}>Invitar</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.card}>
        {cargando && miembros.length === 0 ? (
          <View style={styles.stateRow}>
            <ActivityIndicator size="small" color={colors.brand} />
            <Text style={styles.stateText}>Cargando equipo...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void cargarMiembros()}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          miembros.map((miembro, indice) => (
            <View
              key={miembro.miembro_proyecto_id}
              style={[
                styles.member,
                indice < miembros.length - 1 && styles.memberBorder,
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {inicial(miembro.usuario_nombre)}
                </Text>
              </View>
              <View style={styles.memberText}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {miembro.usuario_nombre}
                </Text>
                <Text style={styles.memberEmail} numberOfLines={1}>
                  {miembro.usuario_correo}
                </Text>
              </View>
              <View
                style={[
                  styles.role,
                  miembro.miembro_rol === 'LIDER' && styles.leaderRole,
                  miembro.miembro_rol === 'CO_LIDER' && styles.coLeaderRole,
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    miembro.miembro_rol === 'LIDER' && styles.leaderRoleText,
                    miembro.miembro_rol === 'CO_LIDER' && styles.coLeaderRoleText,
                  ]}
                >
                  {miembro.miembro_rol === 'LIDER'
                    ? 'Líder'
                    : miembro.miembro_rol === 'CO_LIDER'
                      ? 'Co-líder'
                      : 'Miembro'}
                </Text>
              </View>
              {puedeGestionarMiembros && miembro.usuario_id !== usuarioActualId ? (
                <Pressable
                  accessibilityLabel={`Administrar a ${miembro.usuario_nombre}`}
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() => setMiembroSeleccionado(miembro)}
                  style={({ pressed }) => [
                    styles.manageButton,
                    pressed && styles.manageButtonPressed,
                  ]}
                >
                  <Ionicons name="settings-outline" size={19} color={colors.brandDark} />
                </Pressable>
              ) : null}
            </View>
          ))
        )}
      </View>

      <InvitarMiembroModal
        visible={invitando}
        proyectoId={proyectoId}
        proyectoNombre={proyectoNombre}
        onClose={() => setInvitando(false)}
      />
      <AdministrarMiembroModal
        miembro={miembroSeleccionado}
        onClose={() => setMiembroSeleccionado(null)}
        onUpdated={cargarMiembros}
      />
    </View>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  section: { gap: 12, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  headerText: { flex: 1, gap: 4 },
  eyebrow: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  title: { color: colors.text, fontSize: 22, fontWeight: '700' },
  inviteButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 13,
    backgroundColor: colors.brand,
  },
  inviteButtonPressed: { backgroundColor: colors.brandDark },
  inviteText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  stateRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  stateText: { color: colors.textMuted, fontSize: 13 },
  errorRow: { minHeight: 72, justifyContent: 'center', gap: 5 },
  errorText: { color: '#912018', fontSize: 13 },
  retryText: { color: colors.brand, fontSize: 13, fontWeight: '700' },
  member: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 11,
  },
  memberBorder: { borderBottomWidth: 1, borderBottomColor: '#EEE7F6' },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.brandSoft,
  },
  avatarText: { color: colors.brandDark, fontSize: 16, fontWeight: '800' },
  memberText: { minWidth: 0, flex: 1, gap: 2 },
  memberName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  memberEmail: { color: colors.textMuted, fontSize: 12 },
  role: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0EAF6',
  },
  roleText: { color: colors.brand, fontSize: 10, fontWeight: '700' },
  leaderRole: { backgroundColor: colors.accentSoft },
  leaderRoleText: { color: colors.accentPressed },
  coLeaderRole: { backgroundColor: colors.brandSoft },
  coLeaderRoleText: { color: colors.brandDark },
  manageButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  manageButtonPressed: { backgroundColor: colors.brandSoft },
})
}
