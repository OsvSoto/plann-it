import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GanttChart } from '../../features/carta-gantt/components/GanttChart';
import { useGantt } from '../../features/carta-gantt/hooks/useGantt';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartaGanttScreen() {
  const { id, inicio, fin } = useLocalSearchParams();
  const proyectoId = typeof id === 'string' ? id : '';
  const fechaInicio = typeof inicio === 'string' ? inicio : '2026-08-01'; 
  const fechaFin = typeof fin === 'string' ? fin : '2026-09-01';

  const { tareas, loading, error, cargarDatos } = useGantt(proyectoId);

  // Forza el reload de la Carta Gantt cada vez que la vista entra en foco
  useFocusEffect(
    useCallback(() => {
      if (proyectoId) {
        cargarDatos();
      }
    }, [proyectoId, cargarDatos])
  );

  if (loading && tareas.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6F45A5" />
      </View>
    );
  }

  if (error && tareas.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error al cargar: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5FB' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Carta Gantt - Proyecto: {id}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
    marginTop: 50,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});