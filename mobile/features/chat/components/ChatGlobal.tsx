import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import { supabase } from '../../../lib/supabase'
import { useChatGlobal } from '../context/ChatContext'
import { ArchivoAdjunto, enviarMensajeChat, obtenerMensajes, obtenerProyectosChat } from '../services/chat.service'

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatearDia(isoString: string) {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long'
  }).format(date)
}

function formatearHora(isoString: string) {
  const date = new Date(isoString)
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

function esMismoDia(iso1: string, iso2: string) {
  const d1 = new Date(iso1)
  const d2 = new Date(iso2)
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

export function ChatGlobal() {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const { chatAbierto, setChatAbierto, proyectosNoLeidos, hayNoLeidos, marcarProyectoLeido } = useChatGlobal()
  const [proyectos, setProyectos] = useState<any[]>([])
  const [proyectoActivo, setProyectoActivo] = useState<any>(null)
  const [mensajes, setMensajes] = useState<any[]>([])
  const [texto, setTexto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [miId, setMiId] = useState<string | null>(null)
  
  const [archivoAdjunto, setArchivoAdjunto] = useState<ArchivoAdjunto | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setMiId(data.user.id)
    })
  }, [])

  useEffect(() => {
    if (chatAbierto) {
      cargarProyectos()
    }
  }, [chatAbierto])

  useEffect(() => {
    if (proyectoActivo) {
      cargarMensajes(proyectoActivo.proyectoId)
      marcarProyectoLeido(proyectoActivo.proyectoId)

      const channel = supabase
        .channel(`chat_proyecto_${proyectoActivo.proyectoId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'mensaje'
        }, (payload) => {
          if (payload.new.mensaje_proyecto_id === proyectoActivo.proyectoId) {
            cargarMensajes(proyectoActivo.proyectoId, true)
            marcarProyectoLeido(proyectoActivo.proyectoId)
          }
        })
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'mensajearchivo' 
        }, () => {
          cargarMensajes(proyectoActivo.proyectoId, true)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [proyectoActivo])

  async function cargarProyectos() {
    try {
      const data = await obtenerProyectosChat()
      setProyectos(data)
      if (data.length > 0 && !proyectoActivo) {
        setProyectoActivo(data[0])
      }
    } catch (error) {
      console.error(error)
    }
  }

  async function cargarMensajes(proyectoId: string, silencioso = false) {
    try {
      if (!silencioso) setCargando(true)
      const data = await obtenerMensajes(proyectoId)
      setMensajes(data)
    } catch (error) {
      console.error(error)
    } finally {
      if (!silencioso) setCargando(false)
    }
  }

  async function seleccionarArchivo() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        const nameParts = file.name.split('.')
        const ext = nameParts.length > 1 ? `.${nameParts.pop()}` : ''
        const baseName = nameParts.join('.')

        setArchivoAdjunto({
          uri: file.uri,
          nombreBase: baseName,
          extension: ext,
          mimeType: file.mimeType || 'application/octet-stream',
          tamano: file.size || 0
        })
      }
    } catch (err) {
      console.error('Error al seleccionar archivo', err)
    }
  }

  async function enviar() {
    if ((!texto.trim() && !archivoAdjunto) || !proyectoActivo || enviando) return
    try {
      setEnviando(true)
      await enviarMensajeChat(proyectoActivo.proyectoId, texto, archivoAdjunto)
      setTexto('')
      setArchivoAdjunto(null)
      cargarMensajes(proyectoActivo.proyectoId, true)
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'No se pudo enviar el mensaje')
    } finally {
      setEnviando(false)
    }
  }

  function renderBurbuja({ item, index }: { item: any; index: number }) {
    const esMio = item.mensaje_usuario_id === miId
    const dataArchivo = item.mensajearchivo?.[0]?.archivo

    const olderMsg = mensajes[index + 1]
    const newerMsg = mensajes[index - 1]

    const isNewDay = !olderMsg || !esMismoDia(item.mensaje_fecha_envio, olderMsg.mensaje_fecha_envio)
    const showName = !esMio && (isNewDay || olderMsg?.mensaje_usuario_id !== item.mensaje_usuario_id)

    let showTime = true
    if (newerMsg && newerMsg.mensaje_usuario_id === item.mensaje_usuario_id) {
      if (esMismoDia(item.mensaje_fecha_envio, newerMsg.mensaje_fecha_envio)) {
        const diffMs = Math.abs(new Date(item.mensaje_fecha_envio).getTime() - new Date(newerMsg.mensaje_fecha_envio).getTime())
        const diffMins = diffMs / 60000
        if (diffMins < 3) {
          showTime = false
        }
      }
    }

    return (
      <View>
        {isNewDay && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{formatearDia(item.mensaje_fecha_envio)}</Text>
            <View style={styles.dateLine} />
          </View>
        )}

        <View style={[styles.burbujaContainer, esMio ? styles.burbujaMia : styles.burbujaOtro, { marginBottom: showTime ? 12 : 2 }]}>
          {showName && (
            <Text style={styles.nombreUsuario}>{item.usuario?.usuario_nombre || 'Usuario'}</Text>
          )}
          <View style={[styles.burbuja, esMio ? styles.burbujaMiaBg : styles.burbujaOtroBg]}>
            {!!item.mensaje_texto && (
              <Text style={[styles.textoMensaje, esMio && styles.textoMensajeMio]}>
                {item.mensaje_texto}
              </Text>
            )}

            {dataArchivo && (
              <Pressable 
                style={styles.archivoBurbuja} 
                onPress={() => Linking.openURL(dataArchivo.archivo_url)}
              >
                <Ionicons name="document" size={24} color={esMio ? "#FFFFFF" : colors.brand} />
                <View style={styles.archivoDetalle}>
                  <Text style={[styles.archivoNombre, esMio && styles.textoMensajeMio]} numberOfLines={1}>
                    {dataArchivo.archivo_nombre}
                  </Text>
                  <Text style={[styles.archivoTamano, esMio && styles.textoMensajeMio]}>
                    {formatBytes(dataArchivo.archivo_tamano)}
                  </Text>
                </View>
                <Ionicons name="download-outline" size={20} color={esMio ? "#FFFFFF" : colors.brand} />
              </Pressable>
            )}
          </View>

          {showTime && (
            <Text style={[styles.timeText, esMio ? styles.timeTextMio : styles.timeTextOtro]}>
              {formatearHora(item.mensaje_fecha_envio)}
            </Text>
          )}
        </View>
      </View>
    )
  }

  return (
    <>
      <Pressable
        style={styles.fab}
        onPress={() => setChatAbierto(true)}
      >
        <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
        {hayNoLeidos && <View style={styles.fabBadge} />}
      </Pressable>

      <Modal
        visible={chatAbierto}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setChatAbierto(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Chat de Proyecto</Text>
            </View>
            <Pressable onPress={() => setChatAbierto(false)} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.projectSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollSelector}>
              {proyectos.map((p) => (
                <Pressable
                  key={p.proyectoId}
                  onPress={() => {
                    setProyectoActivo(p)
                    marcarProyectoLeido(p.proyectoId)
                  }}
                  style={[
                    styles.projectPill,
                    proyectoActivo?.proyectoId === p.proyectoId && styles.projectPillActive
                  ]}
                >
                  <Text style={[
                    styles.projectPillText,
                    proyectoActivo?.proyectoId === p.proyectoId && styles.projectPillTextActive
                  ]}>
                    {p.proyectoNombre}
                  </Text>
                  {proyectosNoLeidos.has(p.proyectoId) && <View style={styles.pillBadge} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.chatArea}>
            {cargando && mensajes.length === 0 ? (
              <ActivityIndicator size="large" color={colors.brand} style={styles.loader} />
            ) : proyectos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No tienes proyectos activos</Text>
              </View>
            ) : (
              <FlatList
                data={mensajes}
                keyExtractor={(item) => item.mensaje_id}
                renderItem={renderBurbuja}
                inverted
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            
            {archivoAdjunto && (
              <View style={styles.previewContainer}>
                <View style={styles.previewIconBox}>
                  <Ionicons name="document-text" size={24} color={colors.brand} />
                </View>
                <View style={styles.previewInfo}>
                  <View style={styles.previewNameRow}>
                    <TextInput 
                      style={styles.previewInputName}
                      value={archivoAdjunto.nombreBase}
                      onChangeText={(val) => setArchivoAdjunto({...archivoAdjunto, nombreBase: val})}
                    />
                    <Text style={styles.previewExt}>{archivoAdjunto.extension}</Text>
                  </View>
                  <Text style={styles.previewSize}>{formatBytes(archivoAdjunto.tamano)}</Text>
                </View>
                <Pressable onPress={() => setArchivoAdjunto(null)} style={styles.previewRemoveBtn}>
                  <Ionicons name="close-circle" size={22} color={colors.danger} />
                </Pressable>
              </View>
            )}

            <View style={styles.inputArea}>
              <Pressable onPress={seleccionarArchivo} style={styles.attachBtn} disabled={enviando}>
                <Ionicons name="attach" size={26} color={colors.textMuted} />
              </Pressable>
              <TextInput
                style={styles.input}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#8A918B"
                value={texto}
                onChangeText={setTexto}
                multiline
                editable={!enviando}
              />
              <Pressable 
                onPress={enviar} 
                style={[styles.sendBtn, (!texto.trim() && !archivoAdjunto) || enviando ? styles.sendBtnDisabled : null]}
                disabled={(!texto.trim() && !archivoAdjunto) || enviando}
              >
                {enviando ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  fabBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.brand,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  projectSelector: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },
  scrollSelector: {
    paddingHorizontal: 15,
  },
  projectPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.brandSoft,
    marginHorizontal: 5,
  },
  pillBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  projectPillActive: {
    backgroundColor: colors.brand,
  },
  projectPillText: {
    color: colors.brandDark,
    fontWeight: '600',
    fontSize: 14,
  },
  projectPillTextActive: {
    color: '#FFFFFF',
  },
  chatArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  listContent: {
    padding: 16,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateText: {
    marginHorizontal: 10,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  burbujaContainer: {
    maxWidth: '80%',
  },
  burbujaMia: {
    alignSelf: 'flex-end',
  },
  burbujaOtro: {
    alignSelf: 'flex-start',
  },
  nombreUsuario: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
    marginLeft: 4,
  },
  burbuja: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  burbujaMiaBg: {
    backgroundColor: colors.brand,
    borderBottomRightRadius: 4,
  },
  burbujaOtroBg: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  textoMensaje: {
    fontSize: 15,
    color: colors.text,
  },
  textoMensajeMio: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    color: '#8A918B',
    marginTop: 4,
  },
  timeTextMio: {
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  timeTextOtro: {
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  archivoBurbuja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
    gap: 10,
    minWidth: 200,
  },
  archivoDetalle: {
    flex: 1,
  },
  archivoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  archivoTamano: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachBtn: {
    padding: 10,
    marginRight: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.text,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.brandSoft,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  previewIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  previewInputName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    paddingVertical: 2,
  },
  previewExt: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  previewSize: {
    fontSize: 12,
    color: colors.brand,
    marginTop: 4,
  },
  previewRemoveBtn: {
    padding: 4,
  },
  })
}