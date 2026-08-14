import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { useMiembrosProyecto } from '../hooks/useMiembrosProyecto'
import { InvitarMiembroModal } from './InvitarMiembroModal'

type Props = {
  proyectoId: string
  proyectoNombre: string
  esLider: boolean
}

function inicial(nombre: string) {
  return nombre.trim().charAt(0).toUpperCase() || '?'
}

export function EquipoProyecto({
  proyectoId,
  proyectoNombre,
  esLider,
}: Props) {
  const [invitando, setInvitando] = useState(false)
  const {
    miembros,
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
        {esLider ? (
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
            <ActivityIndicator size="small" color="#6F45A5" />
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
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    miembro.miembro_rol === 'LIDER' && styles.leaderRoleText,
                  ]}
                >
                  {miembro.miembro_rol === 'LIDER' ? 'Líder' : 'Miembro'}
                </Text>
              </View>
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
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 12, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  headerText: { flex: 1, gap: 4 },
  eyebrow: { color: '#766682', fontSize: 11, fontWeight: '700' },
  title: { color: '#342247', fontSize: 22, fontWeight: '700' },
  inviteButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 13,
    backgroundColor: '#6F45A5',
  },
  inviteButtonPressed: { backgroundColor: '#4F2D7F' },
  inviteText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  stateRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  stateText: { color: '#766682', fontSize: 13 },
  errorRow: { minHeight: 72, justifyContent: 'center', gap: 5 },
  errorText: { color: '#912018', fontSize: 13 },
  retryText: { color: '#6F45A5', fontSize: 13, fontWeight: '700' },
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
    backgroundColor: '#E9E1F3',
  },
  avatarText: { color: '#4F2D7F', fontSize: 16, fontWeight: '800' },
  memberText: { minWidth: 0, flex: 1, gap: 2 },
  memberName: { color: '#342247', fontSize: 14, fontWeight: '700' },
  memberEmail: { color: '#766682', fontSize: 12 },
  role: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0EAF6',
  },
  roleText: { color: '#6F45A5', fontSize: 10, fontWeight: '700' },
  leaderRole: { backgroundColor: '#FFF0E8' },
  leaderRoleText: { color: '#D94D1C' },
})
