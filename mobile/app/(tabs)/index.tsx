import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAppColors } from '../../hooks/use-app-colors';
import type { AppColorsShape } from '../../constants/theme';

interface Tarea {
  tarea_id: string;
  tarea_nombre: string;
  tarea_desc?: string;
  tarea_fecha_entrega?: string;
  tarea_estado: string;
  tarea_creado_por: string;
  tarea_lista_id?: string;
  lista?: {
    lista_id: string;
    tablero?: {
      tablero_id: string;
      tablero_proyecto_id: string;
      proyecto?: {
        proyecto_nombre: string;
      };
    };
  };
}

export default function HomeScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarTareasUrgentes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tarea')
        .select(`
          *,
          lista:tarea_lista_id (
            lista_id,
            tablero:lista_tablero_id (
              tablero_id,
              tablero_proyecto_id,
              proyecto:tablero_proyecto_id (
                proyecto_nombre
              )
            )
          )
        `)
        .eq('tarea_creado_por', user.id)
        .neq('tarea_estado', 'COMPLETADA')
        .order('tarea_fecha_entrega', { ascending: true, nullsFirst: false });

      if (error) {
        console.log('Error al cargar tareas:', error);
      } else if (data) {
        setTareas(data as any);
      }
    } catch (err) {
      console.log('Error de conexión:', err);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarTareasUrgentes();
    }, [])
  );

  const alRefrescar = useCallback(() => {
    setRefrescando(true);
    cargarTareasUrgentes();
  }, []);

  const obtenerDiasRestantes = (fechaStr?: string) => {
    if (!fechaStr) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaTarea = new Date(fechaStr);
    fechaTarea.setHours(0, 0, 0, 0);

    const diferenciaMs = fechaTarea.getTime() - hoy.getTime();
    return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
  };

  const obtenerEstiloDias = (dias: number | null) => {
    if (dias === null) {
      return {
        texto: 'Sin fecha',
        color: colors.textMuted,
        bgColor: colors.border,
      };
    }

    if (dias < 0) {
      return {
        texto: `Vencida hace ${Math.abs(dias)} d`,
        color: colors.danger,
        bgColor: colors.dangerSoft,
      };
    }
    if (dias === 0) {
      return {
        texto: '¡Vence Hoy!',
        color: colors.danger,
        bgColor: colors.dangerSoft,
      };
    }
    if (dias >= 1 && dias <= 7) {
      return {
        texto: `${dias} días restantes`,
        color: colors.danger,
        bgColor: colors.dangerSoft,
      };
    }
    if (dias >= 8 && dias <= 14) {
      return {
        texto: `${dias} días restantes`,
        color: '#d97706',
        bgColor: '#fef3c7',
      };
    }

    return {
      texto: `${dias} días restantes`,
      color: '#059669',
      bgColor: '#d1fae5',
    };
  };

  const obtenerEstiloEstado = (estado: string) => {
    const estadoLower = estado?.toLowerCase() || 'pendiente';
    switch (estadoLower) {
      case 'en_progreso':
        return { label: 'En progreso', color: '#0284c7', bgColor: '#e0f2fe' };
      case 'completada':
        return { label: 'Completada', color: '#16a34a', bgColor: '#dcfce7' };
      default:
        return { label: 'Pendiente', color: '#d97706', bgColor: '#fef3c7' };
    }
  };

  const renderTarea = ({ item }: { item: Tarea }) => {
    const dias = obtenerDiasRestantes(item.tarea_fecha_entrega);
    const infoDias = obtenerEstiloDias(dias);
    const infoEstado = obtenerEstiloEstado(item.tarea_estado);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          const proyectoId = item?.lista?.tablero?.tablero_proyecto_id;

          if (proyectoId) {
            router.push(`/carta-gantt/${proyectoId}` as any);
          } else {
            router.push('/(tabs)/proyectos');
          }
        }}
        style={styles.tareaCard}
      >
        <View style={styles.cardTopHeader}>
          <View style={[styles.estadoBadge, { backgroundColor: infoEstado.bgColor }]}>
            <Text style={[styles.estadoBadgeText, { color: infoEstado.color }]}>
              {infoEstado.label}
            </Text>
          </View>

          <View style={[styles.diasBadge, { backgroundColor: infoDias.bgColor }]}>
            <Ionicons name="time-outline" size={13} color={infoDias.color} />
            <Text style={[styles.diasBadgeText, { color: infoDias.color }]}>
              {infoDias.texto}
            </Text>
          </View>
        </View>

        {item.lista?.tablero?.proyecto?.proyecto_nombre ? (
          <View style={styles.enlacesRow}>
            <TouchableOpacity
              activeOpacity={0.6}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/proyectos/${item.lista!.tablero!.tablero_proyecto_id}` as any);
              }}
              style={styles.proyectoBadge}
            >
              <Ionicons name="folder-outline" size={12} color={colors.brand} />
              <Text style={styles.proyectoBadgeText} numberOfLines={1}>
                {item.lista.tablero.proyecto.proyecto_nombre}
              </Text>
              <Ionicons name="chevron-forward" size={12} color={colors.brand} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={(e) => {
                e.stopPropagation();
                router.push(
                  `/proyectos/${item.lista!.tablero!.tablero_proyecto_id}/tableros/${item.lista!.tablero!.tablero_id}` as any
                );
              }}
              style={styles.tableroBadge}
            >
              <Ionicons name="grid-outline" size={12} color={colors.accent} />
              <Text style={styles.tableroBadgeText}>Tablero</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.accent} />
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.tareaTitulo}>{item.tarea_nombre}</Text>

        {item.tarea_desc ? (
          <Text style={styles.tareaDescripcion} numberOfLines={2}>
            {item.tarea_desc}
          </Text>
        ) : null}

        <View style={styles.tareaFooter}>
          <View style={styles.fechaContainer}>
            <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
            <Text style={styles.fechaTexto}>
              {item.tarea_fecha_entrega
                ? `Entrega: ${new Date(item.tarea_fecha_entrega).toLocaleDateString()}`
                : 'Sin fecha límite'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>INICIO</Text>
        <Text style={styles.title}>Tareas pendientes</Text>
      </View>

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={tareas}
          keyExtractor={(item) => item.tarea_id}
          renderItem={renderTarea}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={alRefrescar}
              colors={[colors.brand]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color={colors.brand} />
              <Text style={styles.emptyTitle}>¡Todo al día!</Text>
              <Text style={styles.emptySubtitle}>No tienes tareas pendientes asignadas.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: AppColorsShape) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 16,
      gap: 4,
    },
    eyebrow: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      width: '100%',
      maxWidth: 760,
      alignSelf: 'center',
      padding: 20,
      paddingTop: 6,
      gap: 12,
      flexGrow: 1,
    },
    tareaCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTopHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    estadoBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    estadoBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    diasBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    diasBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    enlacesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 6,
    },
    proyectoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexShrink: 1,
    },
    proyectoBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.brand,
    },
    tableroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    tableroBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accent,
    },
    tareaTitulo: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    tareaDescripcion: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 12,
    },
    tareaFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      marginTop: 6,
    },
    fechaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    fechaTexto: {
      fontSize: 13,
      color: colors.textMuted,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
  });
}
