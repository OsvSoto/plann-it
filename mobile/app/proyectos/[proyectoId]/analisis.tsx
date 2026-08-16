import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native'
import Markdown from 'react-native-markdown-display'
import { SafeAreaView } from 'react-native-safe-area-context'
import { generarYGuardarAnalisis, obtenerAnalisisAnteriores } from '../../../features/ia/services/ia.service'

function formatearFecha(fechaIso: string) {
  const d = new Date(fechaIso)
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

function AnalisisItem({ item }: { item: any }) {
  const [expandido, setExpandido] = useState(false)
  
  const lineas = item.analisis_ia_resultado.trim().split('\n')
  const titulo = lineas[0].replace(/[*"]/g, '')
  const contenidoMarkdown = lineas.slice(1).join('\n').trim()

  return (
    <View style={styles.card}>
      <Pressable 
        onPress={() => setExpandido(!expandido)} 
        style={styles.cardHeaderToggle}
      >
        <View style={styles.cardHeaderInfo}>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={14} color="#766682" />
            <Text style={styles.dateText}>{formatearFecha(item.analisis_ia_fechageneracion)}</Text>
          </View>
          <Text style={styles.cardTitle}>{titulo}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name={expandido ? "chevron-up" : "chevron-down"} size={22} color="#6F45A5" />
        </View>
      </Pressable>

      {expandido && (
        <View style={styles.cardContent}>
          <Markdown style={markdownStyles}>
            {contenidoMarkdown}
          </Markdown>
        </View>
      )}
    </View>
  )
}

export default function AnalisisIAScreen() {
  const { proyectoId } = useLocalSearchParams<{ proyectoId: string }>()
  const [analisis, setAnalisis] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)

  useEffect(() => {
    cargarHistorial()
  }, [])

  async function cargarHistorial() {
    if (!proyectoId) return
    try {
      setCargando(true)
      const data = await obtenerAnalisisAnteriores(proyectoId)
      setAnalisis(data)
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'No pudimos cargar los análisis anteriores.')
    } finally {
      setCargando(false)
    }
  }

  async function crearAnalisis() {
    if (!proyectoId) return
    try {
      setGenerando(true)
      await generarYGuardarAnalisis(proyectoId)
      await cargarHistorial()
    } catch (error: any) {
      console.error(error)
      Alert.alert('Error al generar análisis', error.message || 'Intenta nuevamente.')
    } finally {
      setGenerando(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
      <Stack.Screen options={{ title: 'Análisis de IA' }} />
      
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          disabled={generando}
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#342247" />
        </Pressable>
        <Text style={styles.headerTitle}>Inteligencia Artificial</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.actionContainer}>
        <Pressable onPress={crearAnalisis} disabled={generando} style={{ width: '100%' }}>
          <LinearGradient
            colors={['#FF6B2C', '#6F45A5', '#342247']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateButton}
          >
            {generando ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Pensando...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="sparkles" size={22} color="#FFFFFF" />
                <Text style={styles.generateButtonText}>Generar nuevo análisis</Text>
              </View>
            )}
          </LinearGradient>
        </Pressable>
      </View>

      {cargando ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#6F45A5" />
        </View>
      ) : analisis.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="hardware-chip-outline" size={48} color="#D9CEE8" />
          <Text style={styles.emptyTitle}>Aún no hay análisis</Text>
          <Text style={styles.emptyText}>Presiona el botón superior para que la IA evalúe tu proyecto.</Text>
        </View>
      ) : (
        <FlatList
          data={analisis}
          keyExtractor={(item) => item.analisis_ia_id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AnalisisItem item={item} />}
        />
      )}
    </SafeAreaView>
  )
}

const markdownStyles = StyleSheet.create({
  body: {
    color: '#342247',
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    color: '#342247',
    marginTop: 12,
    marginBottom: 6,
  },
  heading2: {
    color: '#342247',
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    color: '#342247',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 10,
  },
  list_item: {
    marginBottom: 5,
  },
})

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F5FB',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D9CEE8',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    color: '#342247',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D9CEE8',
  },
  generateButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#342247',
  },
  emptyText: {
    fontSize: 14,
    color: '#766682',
    textAlign: 'center',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9CEE8',
    overflow: 'hidden',
  },
  cardHeaderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: '#766682',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    color: '#342247',
    fontSize: 16,
    fontWeight: '700',
    paddingRight: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#E9E1F3',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0EAF6',
    backgroundColor: '#FCFAFE',
  },
})