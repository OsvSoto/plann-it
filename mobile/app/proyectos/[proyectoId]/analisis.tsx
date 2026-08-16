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
import type { AppColorsShape } from '../../../constants/theme'
import { generarYGuardarAnalisis, obtenerAnalisisAnteriores } from '../../../features/ia/services/ia.service'
import { useAppColors } from '../../../hooks/use-app-colors'

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

function AnalisisItem({ item, colors }: { item: any; colors: AppColorsShape }) {
  const styles = createStyles(colors)
  const markdownStyles = createMarkdownStyles(colors)
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
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={styles.dateText}>{formatearFecha(item.analisis_ia_fechageneracion)}</Text>
          </View>
          <Text style={styles.cardTitle}>{titulo}</Text>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name={expandido ? "chevron-up" : "chevron-down"} size={22} color={colors.brand} />
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
  const colors = useAppColors()
  const styles = createStyles(colors)
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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Inteligencia Artificial</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.actionContainer}>
        <Pressable onPress={crearAnalisis} disabled={generando} style={{ width: '100%' }}>
          <LinearGradient
            colors={[colors.accent, colors.brand, colors.brandDark]}
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
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : analisis.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="hardware-chip-outline" size={48} color={colors.border} />
          <Text style={styles.emptyTitle}>Aún no hay análisis</Text>
          <Text style={styles.emptyText}>Presiona el botón superior para que la IA evalúe tu proyecto.</Text>
        </View>
      ) : (
        <FlatList
          data={analisis}
          keyExtractor={(item) => item.analisis_ia_id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AnalisisItem item={item} colors={colors} />}
        />
      )}
    </SafeAreaView>
  )
}

function createMarkdownStyles(colors: AppColorsShape) {
  return StyleSheet.create({
    body: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    heading1: {
      color: colors.text,
      marginTop: 12,
      marginBottom: 6,
    },
    heading2: {
      color: colors.text,
      marginTop: 12,
      marginBottom: 6,
    },
    heading3: {
      color: colors.text,
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
    headerTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    headerSpacer: {
      width: 40,
    },
    actionContainer: {
      padding: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.text,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    list: {
      padding: 20,
      gap: 16,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardHeaderToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.surface,
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
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    cardTitle: {
      color: colors.text,
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
      backgroundColor: colors.brandSoft,
    },
    cardContent: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: colors.brandSoft,
      backgroundColor: colors.background,
    },
  })
}