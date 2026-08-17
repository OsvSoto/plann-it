import React, { useState, useEffect, useCallback } from 'react';
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
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { AppColors } from '../../constants/theme';

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
      tablero_proyecto_id: string;
    };
  };
}

export default function InicioScreen() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarTareasUrgentes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Consulta haciendo join en cadena: tarea -> lista -> tablero
      const { data, error } = await supabase
        .from('tarea')
        .select(`
          *,
          lista:tarea_lista_id (
            lista_id,
            tablero:lista_tablero_id (
              tablero_proyecto_id
            )
          )
        `)
        .eq('tarea_creado_por', user.id)
        .neq('tarea_estado', 'finalizado')
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

  useEffect(() => {
    cargarTareasUrgentes();
  }, []);

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
        color: AppColors.textMuted,
        bgColor: '#f3f4f6',
      };
    }

    if (dias < 0) {
      return {
        texto: `Vencida hace ${Math.abs(dias)} d`,
        color: AppColors.danger,
        bgColor: '#fee2e2',
      };
    }
    if (dias === 0) {
      return {
        texto: '¡Vence Hoy!',
        color: AppColors.danger,
        bgColor: '#fee2e2',
      };
    }
    if (dias >= 1 && dias <= 7) {
      return {
        texto: `${dias} días restantes`,
        color: AppColors.danger,
        bgColor: '#fee2e2',
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
      case 'en desarrollo':
      case 'en_desarrollo':
        return { label: 'En desarrollo', color: '#0284c7', bgColor: '#e0f2fe' };
      case 'finalizado':
      case 'completada':
        return { label: 'Finalizado', color: '#16a34a', bgColor: '#dcfce7' };
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
          // Extraemos el proyecto_id recorriendo la relación tarea -> lista -> tablero
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

        <Text style={styles.tareaTitulo}>{item.tarea_nombre}</Text>

        {item.tarea_desc ? (
          <Text style={styles.tareaDescripcion} numberOfLines={2}>
            {item.tarea_desc}
          </Text>
        ) : null}

        <View style={styles.tareaFooter}>
          <View style={styles.fechaContainer}>
            <Ionicons name="calendar-outline" size={15} color={AppColors.textMuted} />
            <Text style={styles.fechaTexto}>
              {item.tarea_fecha_entrega
                ? `Entrega: ${new Date(item.tarea_fecha_entrega).toLocaleDateString()}`
                : 'Sin fecha límite'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Inicio</Text>
        <Text style={styles.subtitle}>Tus tareas más importantes pendientes</Text>
      </View>

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={AppColors.brand} />
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
              colors={[AppColors.brand]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color={AppColors.brand} />
              <Text style={styles.emptyTitle}>¡Todo al día!</Text>
              <Text style={styles.emptySubtitle}>No tienes tareas pendientes asignadas.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: AppColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  tareaCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
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
  tareaTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  tareaDescripcion: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginBottom: 12,
  },
  tareaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
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
    color: AppColors.textMuted,
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
    color: AppColors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});