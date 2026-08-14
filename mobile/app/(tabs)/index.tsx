import {
  StyleSheet,
  Text
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default function HomeScreen() {
 return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Plann-It
      </Text>
      
      <Text>
        Bienvenido a Plann-It
      </Text>
    </SafeAreaView>
  )};
