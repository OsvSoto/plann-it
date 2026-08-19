import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import type { AppColorsShape } from '../../../constants/theme';
import { useAppColors } from '../../../hooks/use-app-colors';
import type { EstadoTarea } from '../../proyectos/types';
import { TareaGantt } from '../types';

interface GanttChartProps {
  tareas: TareaGantt[];
  proyectoFechaInicio: string;
  proyectoFechaFin: string;
}

const ROW_HEIGHT = 70;
const HEADER_HEIGHT = 50;
const CONTROLS_HEIGHT = 60;

const COLOR_POR_ESTADO: Record<EstadoTarea, string> = {
  PENDIENTE: '#8A7CA8',
  EN_PROGRESO: '#6F45A5',
  COMPLETADA: '#2E9B5F',
};

export const GanttChart: React.FC<GanttChartProps> = ({
  tareas,
  proyectoFechaInicio,
  proyectoFechaFin,
}) => {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const router = useRouter();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const getSantiagoTime = (dateString: string) => {
    if (!dateString) return 0;
    const cleanDate = dateString.split('T')[0];
    return new Date(`${cleanDate}T00:00:00-04:00`).getTime();
  };

  const startProjectDate = getSantiagoTime(proyectoFechaInicio);
  const endProjectDate = getSantiagoTime(proyectoFechaFin);
  const todayTime = new Date().getTime();

  const sortedTareas = useMemo(() => {
    return [...tareas].sort((a, b) => {
      const timeA = a.fecha_inicio ? getSantiagoTime(a.fecha_inicio) : Infinity;
      const timeB = b.fecha_inicio ? getSantiagoTime(b.fecha_inicio) : Infinity;
      return timeA - timeB;
    });
  }, [tareas]);

  const DAY_WIDTH = viewMode === 'day' ? 45 : 15;
  const totalDays = Math.max(1, Math.ceil((endProjectDate - startProjectDate) / (1000 * 60 * 60 * 24)));

  const posiciones = useMemo(() => {
    const mapa = new Map<string, { index: number; left: number; width: number }>();

    sortedTareas.forEach((tarea, index) => {
      const startTaskDate = tarea.fecha_inicio ? getSantiagoTime(tarea.fecha_inicio) : startProjectDate;
      const endTaskDate = tarea.fecha_fin ? getSantiagoTime(tarea.fecha_fin) : startTaskDate + 1000 * 60 * 60 * 24;
      const left = Math.max(0, Math.ceil((startTaskDate - startProjectDate) / (1000 * 60 * 60 * 24)) * DAY_WIDTH);
      const durationDays = Math.max(1, Math.ceil((endTaskDate - startTaskDate) / (1000 * 60 * 60 * 24)));
      const width = Math.max(durationDays * DAY_WIDTH, 80);

      mapa.set(tarea.id_tarea, { index, left, width });
    });

    return mapa;
  }, [sortedTareas, DAY_WIDTH, startProjectDate]);

  // El ancho del grafico debe cubrir tanto la duracion nominal del proyecto
  // como la barra que mas se extienda a la derecha: una tarea que termina
  // muy cerca del fin del proyecto (o con el ancho minimo de 80px) puede
  // sobrepasar el rango de dias nominal y quedar cortada si no se contempla.
  const anchoContenido = Math.max(
    totalDays * DAY_WIDTH,
    ...Array.from(posiciones.values()).map((p) => p.left + p.width)
  );
  const chartWidth = Math.max(screenWidth, anchoContenido);

  const timelineHeight = Math.max(150, sortedTareas.length * ROW_HEIGHT + 20);
  // Las lineas de dia deben llenar la pantalla aunque el proyecto tenga
  // pocas tareas, para que no se vea vacio debajo del contenido.
  const alturaDisponible = screenHeight - CONTROLS_HEIGHT;
  const chartHeight = Math.max(HEADER_HEIGHT + timelineHeight, alturaDisponible);
  const todayLeftOffset = ((todayTime - startProjectDate) / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
  const showTodayLine = todayLeftOffset >= 0 && todayLeftOffset <= chartWidth;

  const renderGrid = () => {
    const gridElements = [];
    const currentDate = new Date(startProjectDate);

    if (viewMode === 'day') {
      for (let i = 0; i <= totalDays; i++) {
        const dateStr = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
        gridElements.push(
          <View key={`day-${i}`} style={[styles.gridColumn, { width: DAY_WIDTH, left: i * DAY_WIDTH }]}>
            <View style={styles.gridHeader}>
              <Text style={styles.gridHeaderText}>{dateStr}</Text>
            </View>
            <View style={styles.gridLine} />
          </View>
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      const dayOfWeek = currentDate.getDay();
      const diffToMonday = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      currentDate.setDate(diffToMonday);

      let weekCount = 1;
      let offsetDays = Math.floor((currentDate.getTime() - startProjectDate) / (1000 * 60 * 60 * 24));

      while (currentDate.getTime() <= endProjectDate + 7 * 24 * 60 * 60 * 1000) {
        const dateStr = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
        const leftPos = offsetDays * DAY_WIDTH;
        const weekWidth = 7 * DAY_WIDTH;

        if (leftPos + weekWidth > 0 && leftPos < chartWidth) {
          gridElements.push(
            <View key={`week-${weekCount}`} style={[styles.gridColumn, { width: weekWidth, left: Math.max(0, leftPos) }]}>
              <View style={styles.gridHeader}>
                <Text style={styles.gridHeaderText}>Sem {weekCount} ({dateStr})</Text>
              </View>
              <View style={styles.gridLine} />
            </View>
          );
        }
        currentDate.setDate(currentDate.getDate() + 7);
        offsetDays += 7;
        weekCount++;
      }
    }
    return gridElements;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={16} color={colors.brandDark} />
          <Text style={styles.backButtonText}>Volver al proyecto</Text>
        </TouchableOpacity>

        <View style={styles.viewModeControls}>
          <TouchableOpacity
            style={[styles.button, viewMode === 'day' && styles.buttonActive]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.buttonText, viewMode === 'day' && styles.buttonTextActive]}>Días</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, viewMode === 'week' && styles.buttonActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.buttonText, viewMode === 'week' && styles.buttonTextActive]}>Semanas</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal style={styles.container}>
        <ScrollView style={styles.verticalScroll}>
          <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
            <View style={styles.gridBackground}>
              {renderGrid()}
            </View>

            {showTodayLine && (
              <View style={[styles.todayLine, { left: todayLeftOffset, height: chartHeight }]} />
            )}

            <View style={[styles.timelineContainer, { height: timelineHeight }]}>
              {sortedTareas.map((tarea) => {
                const posicion = posiciones.get(tarea.id_tarea);
                if (!posicion) return null;

                const cardColor = COLOR_POR_ESTADO[tarea.estado] ?? colors.brand;
                const asignadoText = tarea.asignado && tarea.asignado.trim() !== '' ? tarea.asignado : 'No hay miembro asignado';
                const isExpanded = expandedTask === tarea.id_tarea;

                return (
                  <View
                    key={tarea.id_tarea}
                    style={[
                      styles.taskRow,
                      { top: posicion.index * ROW_HEIGHT, zIndex: isExpanded ? 100 : 2 },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setExpandedTask(isExpanded ? null : tarea.id_tarea)}
                      style={[
                        styles.taskBar,
                        {
                          left: posicion.left,
                          width: posicion.width,
                          backgroundColor: cardColor,
                        },
                      ]}
                    >
                      <Text style={styles.taskName} numberOfLines={isExpanded ? 0 : 1}>{tarea.nombre_tarea}</Text>
                      <Text style={styles.taskAssignee} numberOfLines={1}>{asignadoText}</Text>

                      {isExpanded && (
                        <View style={styles.expandedContent}>
                          <Text style={styles.expandedText}>
                            Inicio: {new Date(getSantiagoTime(tarea.fecha_inicio)).toLocaleDateString('es-CL')}
                          </Text>
                          <Text style={styles.expandedText}>
                            Fin: {new Date(getSantiagoTime(tarea.fecha_fin)).toLocaleDateString('es-CL')}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.background,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.brandSoft,
    },
    backButtonText: {
      color: colors.brandDark,
      fontWeight: 'bold',
      fontSize: 14,
    },
    viewModeControls: {
      flexDirection: 'row',
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      marginHorizontal: 5,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonActive: {
      backgroundColor: colors.brand,
      borderColor: colors.brand,
    },
    buttonText: {
      color: colors.text,
      fontWeight: 'bold',
    },
    buttonTextActive: {
      color: '#FFFFFF',
    },
    container: {
      flex: 1,
    },
    verticalScroll: {
      flex: 1,
    },
    chartArea: {
      position: 'relative',
    },
    gridBackground: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      zIndex: 0,
    },
    gridColumn: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderLeftWidth: 1,
      borderColor: colors.border,
    },
    gridHeader: {
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    gridHeaderText: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: 'bold',
    },
    gridLine: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    todayLine: {
      position: 'absolute',
      top: 0,
      width: 2,
      backgroundColor: colors.danger,
      opacity: 0.6,
      zIndex: 1,
    },
    timelineContainer: {
      position: 'absolute',
      top: HEADER_HEIGHT,
      left: 0,
      right: 0,
    },
    taskRow: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: ROW_HEIGHT,
      justifyContent: 'center',
    },
    taskBar: {
      position: 'absolute',
      minHeight: 50,
      borderRadius: 8,
      padding: 8,
      justifyContent: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
      overflow: 'hidden',
    },
    taskName: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 12,
      marginBottom: 2,
    },
    taskAssignee: {
      color: '#FFFFFF',
      fontSize: 10,
      opacity: 0.9,
    },
    expandedContent: {
      marginTop: 10,
      borderTopWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      paddingTop: 8,
      gap: 4,
    },
    expandedText: {
      color: '#FFFFFF',
      fontSize: 10,
    },
  });
}
