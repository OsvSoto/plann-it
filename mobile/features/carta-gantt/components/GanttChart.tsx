import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TareaGantt } from '../types';

interface GanttChartProps {
  proyectoId: string;
  tareas: TareaGantt[];
  proyectoFechaInicio: string;
  proyectoFechaFin: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GanttChart: React.FC<GanttChartProps> = ({ proyectoId, tareas, proyectoFechaInicio, proyectoFechaFin }) => {
  const router = useRouter();
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
  const chartWidth = Math.max(SCREEN_WIDTH, totalDays * DAY_WIDTH);
  const chartHeight = Math.max(200, sortedTareas.length * 80 + 100);
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
          <Ionicons name="arrow-back" size={16} color="#4F2D7F" />
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
          <View style={[styles.chartArea, { width: chartWidth, minHeight: chartHeight }]}>
            <View style={styles.gridBackground}>
              {renderGrid()}
            </View>

            {showTodayLine && (
              <View style={[styles.todayLine, { left: todayLeftOffset }]} />
            )}

            <View style={styles.timelineContainer}>
              {sortedTareas.map((tarea) => {
                const startTaskDate = tarea.fecha_inicio ? getSantiagoTime(tarea.fecha_inicio) : startProjectDate;
                const endTaskDate = tarea.fecha_fin ? getSantiagoTime(tarea.fecha_fin) : startTaskDate + (1000 * 60 * 60 * 24);
                const leftOffset = Math.max(0, Math.ceil((startTaskDate - startProjectDate) / (1000 * 60 * 60 * 24)) * DAY_WIDTH);
                const taskDurationDays = Math.max(1, Math.ceil((endTaskDate - startTaskDate) / (1000 * 60 * 60 * 24)));
                const taskWidth = taskDurationDays * DAY_WIDTH;
                const cardColor = tarea.color && tarea.color.trim() !== '' ? tarea.color : '#808080';
                const asignadoText = tarea.asignado && tarea.asignado.trim() !== '' ? tarea.asignado : 'No hay miembro asignado';
                const isExpanded = expandedTask === tarea.id_tarea;

                return (
                  <View key={tarea.id_tarea} style={[styles.taskRow, isExpanded && styles.taskRowExpanded, { zIndex: isExpanded ? 100 : 1 }]}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setExpandedTask(isExpanded ? null : tarea.id_tarea)}
                      style={[
                        styles.taskBar,
                        {
                          left: leftOffset,
                          width: isExpanded ? Math.max(taskWidth, 220) : Math.max(taskWidth, 80),
                          backgroundColor: cardColor,
                          height: isExpanded ? 110 : 50,
                        },
                      ]}
                    >
                      <Text style={styles.taskName} numberOfLines={isExpanded ? 0 : 1}>{tarea.nombre_tarea}</Text>
                      <Text style={styles.taskAssignee} numberOfLines={1}>{asignadoText}</Text>
                      
                      {isExpanded && (
                        <View style={styles.expandedContent}>
                          <Text style={styles.expandedText}>
                            Inicio: {tarea.fecha_inicio ? new Date(getSantiagoTime(tarea.fecha_inicio)).toLocaleDateString('es-CL') : 'Pendiente'}
                          </Text>
                          <Text style={styles.expandedText}>
                            Fin: {tarea.fecha_fin ? new Date(getSantiagoTime(tarea.fecha_fin)).toLocaleDateString('es-CL') : 'Pendiente'}
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

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E9E1F3',
  },
  backButtonText: {
    color: '#4F2D7F',
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
    backgroundColor: '#e0e0e0',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  buttonTextActive: {
    color: '#fff',
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
    borderColor: '#e0e0e0',
  },
  gridHeader: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
  },
  gridHeaderText: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  gridLine: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  todayLine: {
    position: 'absolute',
    top: 40,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
    zIndex: 1,
  },
  timelineContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    minHeight: 200,
    zIndex: 2,
  },
  taskRow: {
    height: 60,
    marginBottom: 10,
    position: 'relative',
    justifyContent: 'center',
  },
  taskRowExpanded: {
    height: 120,
  },
  taskBar: {
    position: 'absolute',
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  taskAssignee: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.9,
  },
  expandedContent: {
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingTop: 8,
  },
  expandedText: {
    color: '#fff',
    fontSize: 10,
    marginBottom: 2,
  },
});