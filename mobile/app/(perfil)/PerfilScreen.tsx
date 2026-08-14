import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function PerfilScreen() {
  const [userEmail, setUserEmail] = useState<string | undefined>('');
  const [cargando, setCargando] = useState(true);

  const [nombreUsuario, setNombreUsuario] = useState('Monse Plann-It');
  const [biografia, setBiografia] = useState('¡Hola! Soy parte del equipo creador de Plann-It. Me encanta organizar mis proyectos y mantener todo al día.');
  const [fotoPerfil, setFotoPerfil] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    } catch (error) {
      console.log("Error al obtener usuario:", error);
    } finally {
      setCargando(false);
    }
  };

  const irAlInicio = () => {
    console.log("Navegando al inicio...");
    router.replace('/(tabs)');
  };

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        {/* BOTÓN PARA REDIRECCIONAR AL INDEX */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={irAlInicio}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={26} color="#166534" />
        </TouchableOpacity>

        {/* FOTO DE PERFIL */}
        <Image 
          source={{ uri: fotoPerfil }} 
          style={styles.avatar} 
        />
        
        {/* NOMBRE Y CORREO */}
        <Text style={styles.name}>{nombreUsuario}</Text>
        <Text style={styles.email}>{userEmail}</Text>
        
        {/* SECCIÓN DE BIOGRAFÍA */}
        <View style={styles.bioContainer}>
          <Text style={styles.bioTitle}>Sobre mí</Text>
          <Text style={styles.bioText}>{biografia}</Text>
        </View>

{/* BOTÓN EDITAR PERFIL */}
<TouchableOpacity 
  style={styles.editButton} 
  onPress={() => router.push('/editarPerfil')} // <-- Cambia el alert por la navegación hacia tu nueva pantalla
>
  <Text style={styles.editButtonText}>Editar Perfil</Text>
</TouchableOpacity>

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  card: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 999, // Asegura que esté por encima de cualquier otro elemento
    elevation: 10, // Para Android
    padding: 10, // Área de toque más amplia
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    marginTop: 15,
    borderWidth: 3,
    borderColor: '#166534',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  bioContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  bioTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  bioText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  editButton: {
    borderWidth: 2,
    borderColor: '#166534',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
  },
  editButtonText: {
    color: '#166534',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});