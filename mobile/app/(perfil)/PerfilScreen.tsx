import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase'; // Ajusta la ruta a tu lib/supabase si cambia

export default function PerfilScreen() {
  const [cargando, setCargando] = useState(true);
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [userEmail, setUserEmail] = useState('');
  const [biografia, setBiografia] = useState('Sin biografía.');
  const [fotoPerfil, setFotoPerfil] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');

        // Consultar la tabla usuario de tu base de datos
        const { data, error } = await supabase
  .from('usuario')
  .select('usuario_nombre, usuario_correo, usuario_bio, usuario_foto')
  .eq('usuario_id', user.id)
  .single();

if (error) {
  console.log("Aviso/Error obteniendo datos de tabla usuario:", error.message);
} else if (data) {
  const usuarioData = data as any; // <-- Le dice a VS Code que confíe en que estas columnas sí existen
  if (usuarioData.usuario_nombre) setNombreUsuario(usuarioData.usuario_nombre);
  if (usuarioData.usuario_correo) setUserEmail(usuarioData.usuario_correo);
  if (usuarioData.usuario_bio) setBiografia(usuarioData.usuario_bio);
  if (usuarioData.usuario_foto) setFotoPerfil(usuarioData.usuario_foto);
}
        
      }
    } catch (error) {
      console.log("Error al obtener usuario:", error);
    } finally {
      setCargando(false);
    }
  };

  const irAlInicio = () => {
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
        
        {/* BOTÓN PARA REGRESAR AL INDEX */}
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
          onPress={() => router.push('/editarPerfil')}
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
    zIndex: 999,
    elevation: 10,
    padding: 10,
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