import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditarPerfilScreen() {
  const [nombre, setNombre] = useState('Monse Plann-It');
  const [biografia, setBiografia] = useState('¡Hola! Soy parte del equipo creador de Plann-It. Me encanta organizar mis proyectos y mantener todo al día.');
  const [fotoUrl, setFotoUrl] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
  const [guardando, setGuardando] = useState(false);

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      // Aquí más adelante conectarás con la tabla de Supabase para guardar los cambios
      // Ejemplo: await supabase.from('perfiles').update({ nombre, biografia, foto_url: fotoUrl })....
      
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      router.replace('/perfil'); // Redirige de regreso a la vista de Perfil
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

        {/* CAMPO NOMBRE DE USUARIO */}
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
        />

        {/* CAMPO URL DE FOTO */}
        <Text style={styles.label}>URL de foto de perfil</Text>
        <TextInput
          style={styles.input}
          value={fotoUrl}
          onChangeText={setFotoUrl}
          placeholder="https://..."
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
    marginBottom: 20,
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