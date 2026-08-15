import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditarPerfilScreen() {
  const [nombre, setNombre] = useState('Monse Plann-It');
  const [biografia, setBiografia] = useState('¡Hola! Soy parte del equipo creador de Plann-It. Me encanta organizar mis proyectos y mantener todo al día.');
  // Estado para la foto (guardará la dirección local de la imagen seleccionada)
  const [fotoPerfil, setFotoPerfil] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
  const [guardando, setGuardando] = useState(false);

  // FUNCIÓN PARA ABRIR LA GALERÍA DEL CELULAR
  const seleccionarFoto = async () => {
    // Solicitar permisos para acceder a la galería
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para cambiar la imagen de perfil.');
      return;
    }

    // Abrir la galería de fotos
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Permite al usuario recortar/ajustar la foto
      aspect: [1, 1],       // Mantiene la imagen en formato cuadrado
      quality: 0.8,
    });

    if (!resultado.canceled && resultado.assets[0].uri) {
      // Guardar la dirección local de la nueva foto
      setFotoPerfil(resultado.assets[0].uri);
    }
  };

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      // Más adelante subiremos la foto a Supabase Storage y actualizaremos la tabla de perfiles
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      router.replace('/perfil');
    } catch (error) {
      console.log('Error al guardar:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        
        {/* BOTÓN REGRESAR AL PERFIL */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/perfil')}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={26} color="#166534" />
        </TouchableOpacity>

        <Text style={styles.title}>Editar Perfil</Text>

        {/* SECCIÓN DE FOTO DE PERFIL CON BOTÓN DE GALERÍA */}
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

        {/* CAMPO NOMBRE DE USUARIO */}
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
        />

        {/* CAMPO BIOGRAFÍA */}
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