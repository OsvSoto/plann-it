import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { useAppColors } from '../../../hooks/use-app-colors'
import type { AppColorsShape } from '../../../constants/theme'
import { formatearEntradaFecha } from '../utils/fecha'
import { CalendarioModal } from './CalendarioModal'

type Props = {
  accessibilityLabel: string
  editable?: boolean
  valor: string
  onChange: (fecha: string) => void
}

export function CampoFecha({
  accessibilityLabel,
  editable = true,
  valor,
  onChange,
}: Props) {
  const colors = useAppColors()
  const styles = createStyles(colors)
  const [calendarioVisible, setCalendarioVisible] = useState(false)

  return (
    <>
      <View style={styles.container}>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          editable={editable}
          keyboardType="number-pad"
          maxLength={10}
          placeholder="DD-MM-AAAA"
          placeholderTextColor="#8A918B"
          style={styles.input}
          value={valor}
          onChangeText={(texto) => onChange(formatearEntradaFecha(texto))}
        />
        <Pressable
          accessibilityLabel={`Abrir calendario para ${accessibilityLabel.toLowerCase()}`}
          accessibilityRole="button"
          disabled={!editable}
          hitSlop={6}
          onPress={() => setCalendarioVisible(true)}
          style={({ pressed }) => [
            styles.calendarButton,
            pressed && styles.calendarButtonPressed,
          ]}
        >
          <Ionicons name="calendar-outline" size={21} color={colors.brand} />
        </Pressable>
      </View>

      <CalendarioModal
        visible={calendarioVisible}
        valor={valor}
        onClose={() => setCalendarioVisible(false)}
        onSelect={onChange}
      />
    </>
  )
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
  container: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  input: {
    minWidth: 0,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  calendarButton: {
    width: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  calendarButtonPressed: { backgroundColor: colors.brandSoft },
})
}
