import { useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProyectoCard } from '../../features/proyectos/components/ProyectoCard'
import { useProyectos } from '../../features/proyectos/hooks/useProyectos'

export default function ProyectosScreen() {
  const {
    proyectos,
    cargando,
    error,
    cargarProyectos,
  } = useProyectos()

  useFocusEffect(
    useCallback(() => {
      void cargarProyectos()
    }, [cargarProyectos])
  )

  function abrirCreacion() {
    router.push('/proyectos/crear')
  }

  function abrirProyecto(proyectoId: string) {
    router.push({
      pathname: '/proyectos/[proyectoId]',
      params: { proyectoId },
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>ESPACIOS DE TRABAJO</Text>
          <Text style={styles.title}>Mis proyectos</Text>
        </View>

        <Pressable
          accessibilityLabel="Crear proyecto"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={abrirCreacion}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {cargando && proyectos.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#166534" />
          <Text style={styles.stateText}>Cargando proyectos...</Text>
        </View>
      ) : error && proyectos.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.stateIcon}>
            <Ionicons name="cloud-offline-outline" size={28} color="#B42318" />
          </View>
          <Text style={styles.stateTitle}>No pudimos cargar tus proyectos</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={cargarProyectos}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : proyectos.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="folder-open-outline" size={32} color="#166534" />
          </View>
          <Text style={styles.stateTitle}>Aún no tienes proyectos</Text>
          <Text style={styles.stateText}>
            Crea el primero para organizar el trabajo de tu equipo.
          </Text>
          <Pressable style={styles.primaryButton} onPress={abrirCreacion}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Crear proyecto</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={proyectos}
          keyExtractor={(proyecto) => proyecto.proyecto_id}
          renderItem={({ item }) => (
            <ProyectoCard
              proyecto={item}
              onPress={() => abrirProyecto(item.proyecto_id)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshing={cargando}
          onRefresh={cargarProyectos}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: '#667069',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: '#172019',
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
  },
  addButtonPressed: {
    backgroundColor: '#14532D',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
    gap: 10,
  },
  stateIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: '#FEF3F2',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: '#DCFCE7',
  },
  stateTitle: {
    color: '#172019',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateText: {
    color: '#667069',
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
    borderColor: '#AAB2AC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  retryText: {
    color: '#273029',
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#166534',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 28,
  },
  separator: {
    height: 12,
  },
})
