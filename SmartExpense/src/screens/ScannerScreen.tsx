import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TextInput, ScrollView, ActivityIndicator, FlatList, SafeAreaView, Linking, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { parseGastos, getTotal, Gasto } from '../utils/pdfParser';
import { useGastos } from '../context/GastosContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';

type ScannerScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Scanner'>;
};

export default function ScannerScreen({ navigation }: ScannerScreenProps) {
  const { insertarGastos } = useGastos();
  const { colors } = useTheme();
  const [pdfName, setPdfName] = useState<string>('');
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [guardando, setGuardando] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const handleSelectPDF = () => {
    Alert.alert(
      'Extraer texto del PDF',
      'Para extraer el texto del PDF, usa el script Node.js incluido en la carpeta del proyecto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver instrucciones', onPress: () => setShowHelp(true) },
      ]
    );
  };

  const processText = () => {
    if (!rawText.trim()) {
      Alert.alert('Error', 'Ingresa texto para procesar');
      return;
    }
    const parsed = parseGastos(rawText);
    setGastos(parsed);
    if (parsed.length === 0) {
      Alert.alert('Sin resultados', 'No se detectaron gastos. Revisa el formato del texto.');
    } else {
      Alert.alert('Procesado', `Se encontraron ${parsed.length} gastos`);
    }
  };

  const guardarGastos = async () => {
    if (gastos.length === 0) {
      Alert.alert('Error', 'Primero procesa el texto para detectar gastos');
      return;
    }

    Alert.alert(
      'Confirmar',
      `¿Guardar ${gastos.length} gastos en la base de datos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async () => {
            setGuardando(true);
            try {
              await insertarGastos(gastos);
              Alert.alert('Éxito', `${gastos.length} gastos guardados`);
              navigation.navigate('Home');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron guardar los gastos');
            } finally {
              setGuardando(false);
            }
          },
        },
      ]
    );
  };

  const total = getTotal(gastos);

  if (showHelp) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Instrucciones" />
        <ScrollView style={styles.helpContainer}>
          <View style={[styles.helpCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.helpTitle, { color: colors.text }]}>
              Cómo extraer texto de tu PDF
            </Text>
            
            <View style={styles.helpStep}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Abre una terminal
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  Ve a la carpeta SmartExpense y abre una terminal
                </Text>
              </View>
            </View>

            <View style={styles.helpStep}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Copia tu PDF a la carpeta
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  Asegúrate que el archivo .pdf esté en la carpeta del proyecto
                </Text>
              </View>
            </View>

            <View style={styles.helpStep}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Ejecuta el script
                </Text>
                <View style={[styles.codeBlock, { backgroundColor: colors.background }]}>
                  <Text style={styles.codeText}>node extract-pdf.js "archivo.pdf"</Text>
                </View>
              </View>
            </View>

            <View style={styles.helpStep}>
              <Text style={styles.stepNumber}>4</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Copia el resultado
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  Seleciona todo el texto que aparece en consola
                </Text>
              </View>
            </View>

            <View style={styles.helpStep}>
              <Text style={styles.stepNumber}>5</Text>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  Pega el texto aquí
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                  Vuelve a la app, pégalo y presiona "Procesar Texto"
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowHelp(false)}
          >
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>
              Entendido, volver
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Scanner" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Selecciona un PDF y extrae el texto manualmente
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Seleccionar PDF" 
            onPress={handleSelectPDF}
            color="#4A90D9"
          />
        </View>

        <TouchableOpacity 
          style={[styles.helpButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowHelp(true)}
        >
          <Text style={styles.helpIcon}>📖</Text>
          <Text style={[styles.helpButtonText, { color: colors.text }]}>
            ¿Cómo extraer texto del PDF?
          </Text>
          <Text style={[styles.helpChevron, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text }]}>
          Pega el texto extraído del PDF:
        </Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Pega aquí el texto del PDF..."
          placeholderTextColor={colors.textSecondary}
          value={rawText}
          onChangeText={(text) => {
            setRawText(text);
            setGastos([]);
          }}
          multiline
          numberOfLines={12}
        />

        <View style={styles.buttonContainer}>
          <Button title="Procesar Texto" onPress={processText} color="#4A90D9" />
        </View>

        {gastos.length > 0 && (
          <View style={[styles.resultsCard, { backgroundColor: colors.surface }]}>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsTitle, { color: colors.text }]}>
                Gastos detectados
              </Text>
              <Text style={[styles.resultsCount, { color: colors.primary }]}>
                {gastos.length}
              </Text>
            </View>
            
            <Text style={[styles.totalText, { color: colors.danger }]}>
              Total: ${total.toFixed(2)}
            </Text>
            
            <FlatList
              data={gastos.slice(0, 20)}
              keyExtractor={(item, index) => `${item.fecha}-${index}`}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={[styles.gastoItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.gastoLeft}>
                    <Text style={[styles.gastoFecha, { color: colors.textSecondary }]}>
                      {item.fecha}
                    </Text>
                    <Text style={[styles.gastoDesc, { color: colors.text }]} numberOfLines={1}>
                      {item.descripcion}
                    </Text>
                    {item.montoUSD && (
                      <Text style={[styles.gastoUSD, { color: colors.accent }]}>
                        US${item.montoUSD.toFixed(2)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.montoText, { color: colors.danger }]}>
                    ${item.monto.toFixed(2)}
                  </Text>
                </View>
              )}
            />
            
            {gastos.length > 20 && (
              <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                +{gastos.length - 20} gastos más...
              </Text>
            )}
          </View>
        )}

        {gastos.length > 0 && (
          <View style={styles.buttonContainer}>
            {guardando ? (
              <ActivityIndicator size="large" color="#4A90D9" />
            ) : (
              <Button title="Guardar en Base de Datos" onPress={guardarGastos} color="#28A745" />
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Volver al Home"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  helpContainer: {
    flex: 1,
    padding: 15,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 8,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  helpIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  helpButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  helpChevron: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    height: 200,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  resultsCard: {
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  gastoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  gastoLeft: {
    flex: 1,
    marginRight: 10,
  },
  gastoFecha: {
    fontSize: 12,
    marginBottom: 2,
  },
  gastoDesc: {
    fontSize: 14,
  },
  gastoUSD: {
    fontSize: 12,
    marginTop: 2,
  },
  montoText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  moreText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  closeButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpCard: {
    borderRadius: 16,
    padding: 20,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  helpStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90D9',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
  },
  codeBlock: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#4A90D9',
  },
});