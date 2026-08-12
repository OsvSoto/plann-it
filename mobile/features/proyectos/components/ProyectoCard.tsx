import {
  StyleSheet,
  Text,
  View,
} from 'react-native'

import type { Proyecto } from '../types'

type Props = {
  proyecto: Proyecto
}

export function ProyectoCard({ proyecto }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.nombre}>
        {proyecto.proyecto_nombre}
      </Text>

      {proyecto.proyecto_descripcion ? (
        <Text style={styles.descripcion}>
          {proyecto.proyecto_descripcion}
        </Text>
      ) : null}

      <Text>
        Estado: {proyecto.proyecto_estado}
      </Text>

      <Text>
        Fecha fin: {proyecto.proyecto_fecha_fin}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 16,
    gap: 6,
  },

  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  descripcion: {
    fontSize: 15,
  },
})