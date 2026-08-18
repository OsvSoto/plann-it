import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppColors } from '../../constants/theme'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandIcon}>
        <Ionicons name="people-outline" size={34} color={AppColors.brand} />
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 24,
    backgroundColor: AppColors.background,
  },
  brandIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: AppColors.brandSoft,
  },
  title: {
    color: AppColors.brand,
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: AppColors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
})
