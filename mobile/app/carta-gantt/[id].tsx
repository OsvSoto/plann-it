import { useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { GanttChart } from '../../features/carta-gantt/components/GanttChart';
import { obtenerDetalleProyecto } from '../../features/proyectos/services/proyecto.service';
import type { DetalleProyecto } from '../../features/proyectos/types';
import type { TareaGantt } from '../../features/carta-gantt/types';

export default function CartaGanttScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detalle, setDetalle] = useState<DetalleProyecto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    cargarDatos();
  }, [id]);

  async function cargarDatos() {
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerDetalleProyecto(id!);
      setDetalle(datos);
    } catch (err) {
      console.error('Error al cargar proyecto:', err);
      setError('No fue posible cargar el proyecto');
    } finally {
      setCargando(false);
    }
  }

  if (!id) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5FB' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Proyecto no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cargando) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5FB' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#6F45A5" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !detalle) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5FB' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#D32F2F' }}>{error || 'Error al cargar'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Construir array de tareas desde tableros y listas
  const tareas: TareaGantt[] = detalle.tableros.flatMap((tablero) =>
    tablero.listas.flatMap((lista) =>
      lista.tareas.map((tarea) => ({
        id_tarea: tarea.tarea_id,
        nombre_tarea: tarea.tarea_nombre,
        fecha_inicio: tarea.tarea_fecha_entrega, // Campo de fecha
        fecha_fin: tarea.tarea_fecha_entrega,    // Usar la misma fecha
        asignado: tarea.asignaciones?.[0]?.usuario_nombre || null,
        color: '#6F45A5',
      }))
    )
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5FB' }}>
      <ScrollView style={{ flex: 1 }}>
        <GanttChart
          proyectoId={id}
          tareas={tareas}
          proyectoFechaInicio={detalle.proyecto.proyecto_fecha_inicio}
          proyectoFechaFin={detalle.proyecto.proyecto_fecha_fin}
        />
      </ScrollView>
    </SafeAreaView>
  );
}