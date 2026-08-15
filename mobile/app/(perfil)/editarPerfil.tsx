import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function EditarPerfilScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [correo, setCorreo] = useState('');
  const [nombre, setNombre] = useState('');
  const [biografia, setBiografia] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setCorreo(user.email || '');

        const { data } = await supabase
          .from('usuario')
          .select('usuario_nombre, usuario_correo, usuario_bio, usuario_foto')
          .eq('usuario_id', user.id)
          .single();

        if (data) {
          const usuarioData = data as any;
          if (usuarioData.usuario_nombre) setNombre(usuarioData.usuario_nombre);
          if (usuarioData.usuario_correo) setCorreo(usuarioData.usuario_correo);
          if (usuarioData.usuario_bio) setBiografia(usuarioData.usuario_bio);
          if (usuarioData.usuario_foto) setFotoPerfil(usuarioData.usuario_foto);
        }
      }
    } catch (error) {
      console.log('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para cambiar la imagen de perfil.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets[0].uri) {
      setFotoPerfil(resultado.assets[0].uri);
    }
  };

  const guardarCambios = async () => {
    if (!userId) return;
    setGuardando(true);
    try {
      const { error } = await supabase
        .from('usuario')
        .upsert({
          usuario_id: userId,
          usuario_correo: correo,
          usuario_nombre: nombre,
          usuario_bio: biografia,
          usuario_foto: fotoPerfil,
        } as any);

      if (error) {
        throw error;
      }

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      router.replace('/perfil');
    } catch (error: any) {
      console.log('Error al guardar:', error);
      Alert.alert('Error', error.message || 'No se pudieron guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        
        {/* BOTÓN REGRESAR */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/perfil')}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={26} color="#166534" />
        </TouchableOpacity>

        <Text style={styles.title}>Editar Perfil</Text>

        {/* FOTO DE PERFIL */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={seleccionarFoto} activeOpacity={0.8} style={styles.avatarContainer}>
            <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={18} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={seleccionarFoto} style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
          </TouchableOpacity>
        </View>

        {/* NOMBRE DE USUARIO */}
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
        />

        {/* BIOGRAFÍA */}
        <Text style={styles.label}>Biografía</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={biografia}
          onChangeText={setBiografia}
          placeholder="Escribe algo sobre ti..."
          multiline
          numberOfLines={4}
        />

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={guardarCambios}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    paddingVertical: 30,
  },
  card: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    width: '85%',
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#166534',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#166534',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#166534',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  changePhotoButton: {
    marginTop: 8,
  },
  changePhotoText: {
    color: '#166534',
    fontWeight: 'bold',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#166534',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});