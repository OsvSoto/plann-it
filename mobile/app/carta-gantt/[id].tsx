import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AppColorsShape } from '../../constants/theme';
import { GanttChart } from '../../features/carta-gantt/components/GanttChart';
import type { TareaGantt } from '../../features/carta-gantt/types';
import { obtenerDetalleProyecto } from '../../features/proyectos/services/proyecto.service';
import type { DetalleProyecto } from '../../features/proyectos/types';
import { useAppColors } from '../../hooks/use-app-colors';

export default function CartaGanttScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.text}>Proyecto no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !detalle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Error al cargar'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tareas: TareaGantt[] = detalle.tableros.flatMap((tablero) =>
    tablero.listas.flatMap((lista) =>
      lista.tareas.map((tarea) => ({
        id_tarea: tarea.tarea_id,
        nombre_tarea: tarea.tarea_nombre,
        fecha_inicio: tarea.tarea_fecha_entrega, 
        fecha_fin: tarea.tarea_fecha_entrega,    
        asignado: tarea.asignaciones?.[0]?.usuario_nombre || null,
        color: colors.brand,
      }))
    )
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll}>
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

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: colors.text,
      fontSize: 16,
    },
    errorText: {
      color: colors.danger,
      fontSize: 16,
    },
  });
}