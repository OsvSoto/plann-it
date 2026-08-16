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
  const { chatAbierto, setChatAbierto } = useChatGlobal()
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
      
      const channel = supabase
        .channel(`chat_proyecto_${proyectoActivo.proyectoId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'mensaje'
        }, (payload) => {
          if (payload.new.mensaje_proyecto_id === proyectoActivo.proyectoId) {
            cargarMensajes(proyectoActivo.proyectoId, true)
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
                <Ionicons name="document" size={24} color={esMio ? "#FFFFFF" : "#6F45A5"} />
                <View style={styles.archivoDetalle}>
                  <Text style={[styles.archivoNombre, esMio && styles.textoMensajeMio]} numberOfLines={1}>
                    {dataArchivo.archivo_nombre}
                  </Text>
                  <Text style={[styles.archivoTamano, esMio && styles.textoMensajeMio]}>
                    {formatBytes(dataArchivo.archivo_tamano)}
                  </Text>
                </View>
                <Ionicons name="download-outline" size={20} color={esMio ? "#FFFFFF" : "#6F45A5"} />
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
              <Ionicons name="close" size={24} color="#342247" />
            </Pressable>
          </View>

          <View style={styles.projectSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollSelector}>
              {proyectos.map((p) => (
                <Pressable
                  key={p.proyectoId}
                  onPress={() => setProyectoActivo(p)}
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
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.chatArea}>
            {cargando && mensajes.length === 0 ? (
              <ActivityIndicator size="large" color="#6F45A5" style={styles.loader} />
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
                  <Ionicons name="document-text" size={24} color="#6F45A5" />
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
                  <Ionicons name="close-circle" size={22} color="#B42318" />
                </Pressable>
              </View>
            )}

            <View style={styles.inputArea}>
              <Pressable onPress={seleccionarArchivo} style={styles.attachBtn} disabled={enviando}>
                <Ionicons name="attach" size={26} color="#766682" />
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

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6F45A5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F5FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D9CEE8',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#342247',
  },
  closeBtn: {
    padding: 4,
  },
  projectSelector: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D9CEE8',
    paddingVertical: 10,
  },
  scrollSelector: {
    paddingHorizontal: 15,
  },
  projectPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E9E1F3',
    marginHorizontal: 5,
  },
  projectPillActive: {
    backgroundColor: '#6F45A5',
  },
  projectPillText: {
    color: '#4F2D7F',
    fontWeight: '600',
    fontSize: 14,
  },
  projectPillTextActive: {
    color: '#FFFFFF',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#F8F5FB',
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
    color: '#766682',
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
    backgroundColor: '#D9CEE8',
  },
  dateText: {
    marginHorizontal: 10,
    color: '#766682',
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
    color: '#766682',
    marginBottom: 4,
    marginLeft: 4,
  },
  burbuja: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  burbujaMiaBg: {
    backgroundColor: '#6F45A5',
    borderBottomRightRadius: 4,
  },
  burbujaOtroBg: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderBottomLeftRadius: 4,
  },
  textoMensaje: {
    fontSize: 15,
    color: '#342247',
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
    color: '#342247',
  },
  archivoTamano: {
    fontSize: 11,
    color: '#766682',
    marginTop: 2,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D9CEE8',
  },
  attachBtn: {
    padding: 10,
    marginRight: 4,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8F5FB',
    borderWidth: 1,
    borderColor: '#D9CEE8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: '#342247',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#D9CEE8',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E9E1F3',
    borderTopWidth: 1,
    borderTopColor: '#D9CEE8',
    gap: 12,
  },
  previewIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D9CEE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  previewInputName: {
    flex: 1,
    fontSize: 14,
    color: '#342247',
    fontWeight: '600',
    paddingVertical: 2,
  },
  previewExt: {
    fontSize: 14,
    color: '#766682',
    fontWeight: '600',
  },
  previewSize: {
    fontSize: 12,
    color: '#6F45A5',
    marginTop: 4,
  },
  previewRemoveBtn: {
    padding: 4,
  },
})