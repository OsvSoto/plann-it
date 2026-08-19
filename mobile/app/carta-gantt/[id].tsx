import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AppColorsShape } from '../../constants/theme';
import { GanttChart } from '../../features/carta-gantt/components/GanttChart';
import type { TareaGantt } from '../../features/carta-gantt/types';
import { obtenerDetalleProyecto } from '../../features/proyectos/services/proyecto.service';
import type { DetalleProyecto, EstadoTarea } from '../../features/proyectos/types';
import { useAppColors } from '../../hooks/use-app-colors';

export default function CartaGanttScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [detalle, setDetalle] = useState<DetalleProyecto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!id) return;
    try {
      setCargando(true);
      setError(null);
      const datosProyecto = await obtenerDetalleProyecto(id);
      setDetalle(datosProyecto);
    } catch (err) {
      console.error('Error al cargar proyecto:', err);
      setError('No fue posible cargar el proyecto');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  useFocusEffect(
    useCallback(() => {
      void ScreenOrientation.unlockAsync();

      return () => {
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

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
        fecha_inicio: tarea.tarea_fecha_inicio,
        fecha_fin: tarea.tarea_fecha_entrega,
        estado: tarea.tarea_estado as EstadoTarea,
        asignado: tarea.asignaciones?.[0]?.usuario_nombre || null,
      }))
    )
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <GanttChart
        tareas={tareas}
        proyectoFechaInicio={detalle.proyecto.proyecto_fecha_inicio}
        proyectoFechaFin={detalle.proyecto.proyecto_fecha_fin}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
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
