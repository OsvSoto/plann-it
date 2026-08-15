import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { AppColors } from '../../../constants/theme'
import {
  fechaDateAVisual,
  fechaVisualADate,
} from '../utils/fecha'

type Props = {
  visible: boolean
  valor: string
  onClose: () => void
  onSelect: (fecha: string) => void
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

function inicioMes(fecha: Date) {
  return new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1))
}

function hoyComoFechaUtc() {
  const ahora = new Date()
  return new Date(Date.UTC(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  ))
}

export function CalendarioModal({
  visible,
  valor,
  onClose,
  onSelect,
}: Props) {
  const [mesVisible, setMesVisible] = useState(() => inicioMes(hoyComoFechaUtc()))

  useEffect(() => {
    if (visible) {
      setMesVisible(inicioMes(fechaVisualADate(valor) ?? hoyComoFechaUtc()))
    }
  }, [valor, visible])

  const anio = mesVisible.getUTCFullYear()
  const mes = mesVisible.getUTCMonth()
  const cantidadDias = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate()
  const espaciosIniciales = (new Date(Date.UTC(anio, mes, 1)).getUTCDay() + 6) % 7
  const fechaSeleccionada = fechaVisualADate(valor)
  const hoy = hoyComoFechaUtc()

  function cambiarMes(cantidad: number) {
    setMesVisible(new Date(Date.UTC(anio, mes + cantidad, 1)))
  }

  function seleccionarDia(dia: number) {
    onSelect(fechaDateAVisual(new Date(Date.UTC(anio, mes, dia))))
    onClose()
  }

  function esSeleccionado(dia: number) {
    return fechaSeleccionada?.getUTCFullYear() === anio
      && fechaSeleccionada.getUTCMonth() === mes
      && fechaSeleccionada.getUTCDate() === dia
  }

  function esHoy(dia: number) {
    return hoy.getUTCFullYear() === anio
      && hoy.getUTCMonth() === mes
      && hoy.getUTCDate() === dia
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Cerrar calendario"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View style={styles.calendar}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Mes anterior"
              accessibilityRole="button"
              onPress={() => cambiarMes(-1)}
              style={styles.iconButton}
            >
              <Ionicons name="chevron-back" size={22} color={AppColors.brandDark} />
            </Pressable>
            <Text style={styles.monthTitle}>{MESES[mes]} {anio}</Text>
            <Pressable
              accessibilityLabel="Mes siguiente"
              accessibilityRole="button"
              onPress={() => cambiarMes(1)}
              style={styles.iconButton}
            >
              <Ionicons name="chevron-forward" size={22} color={AppColors.brandDark} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {DIAS_SEMANA.map((dia) => (
              <View key={dia} style={styles.dayCell}>
                <Text style={styles.weekDay}>{dia}</Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array.from({ length: espaciosIniciales }).map((_, indice) => (
              <View key={`vacio-${indice}`} style={styles.dayCell} />
            ))}
            {Array.from({ length: cantidadDias }).map((_, indice) => {
              const dia = indice + 1
              const seleccionado = esSeleccionado(dia)

              return (
                <View key={dia} style={styles.dayCell}>
                  <Pressable
                    accessibilityLabel={`${dia} de ${MESES[mes]} de ${anio}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: seleccionado }}
                    onPress={() => seleccionarDia(dia)}
                    style={({ pressed }) => [
                      styles.dayButton,
                      esHoy(dia) && styles.todayButton,
                      seleccionado && styles.selectedDay,
                      pressed && styles.dayPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        seleccionado && styles.selectedDayText,
                      ]}
                    >
                      {dia}
                    </Text>
                  </Pressable>
                </View>
              )
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onSelect(fechaDateAVisual(hoyComoFechaUtc()))
                onClose()
              }}
              style={styles.todayAction}
            >
              <Text style={styles.todayActionText}>Hoy</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#24153299',
  },
  calendar: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 12,
    padding: 18,
    backgroundColor: AppColors.surface,
    shadowColor: AppColors.brandDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.brandSoft,
  },
  monthTitle: { color: AppColors.text, fontSize: 17, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.2857%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDay: { color: AppColors.textMuted, fontSize: 12, fontWeight: '700' },
  dayButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  todayButton: { borderWidth: 1, borderColor: AppColors.accent },
  selectedDay: { borderColor: AppColors.brand, backgroundColor: AppColors.brand },
  dayPressed: { opacity: 0.65 },
  dayText: { color: AppColors.text, fontSize: 14, fontWeight: '600' },
  selectedDayText: { color: AppColors.surface, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    marginTop: 14,
    paddingTop: 14,
  },
  todayAction: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 10 },
  todayActionText: { color: AppColors.brand, fontSize: 14, fontWeight: '700' },
  closeButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 10 },
  closeText: { color: AppColors.textMuted, fontSize: 14, fontWeight: '600' },
})
