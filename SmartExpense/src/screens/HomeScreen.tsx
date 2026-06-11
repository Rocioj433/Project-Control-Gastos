import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Modal, SafeAreaView, Switch, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGastos } from '../context/GastosContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import SummaryCard from '../components/SummaryCard';
import GastoItem from '../components/GastoItem';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const MESES = [
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { loading, gastos } = useGastos();
  const { theme, colors, toggleTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('02');

  const mesActual = MESES.find(m => m.value === selectedMonth)?.label || 'Febrero';
  const gastosFiltrados = gastos.filter(g => g.mes === selectedMonth);

  const resumenFiltrado = {
    totalPesos: gastosFiltrados.reduce((sum, g) => sum + g.monto, 0),
    totalUSD: gastosFiltrados.reduce((sum, g) => sum + (g.montoUSD ?? 0), 0),
    cantidad: gastosFiltrados.length,
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="SmartExpense" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="SmartExpense" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Text style={[styles.toggleLabel, { color: colors.textSecondary }]}>
              {theme === 'light' ? 'Modo claro' : 'Modo oscuro'}
            </Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#D1D1D1', true: '#4A90D9' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity style={[styles.monthSelector, { backgroundColor: colors.surface }]} onPress={() => setShowModal(true)}>
          <View style={styles.monthSelectorLeft}>
            <Text style={styles.monthIcon}>📅</Text>
            <Text style={[styles.monthText, { color: colors.text }]}>{mesActual}</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <SummaryCard
          totalPesos={resumenFiltrado.totalPesos}
          totalUSD={resumenFiltrado.totalUSD}
          cantidad={resumenFiltrado.cantidad}
          mes={mesActual}
        />

        <View style={styles.gastosHeader}>
          <Text style={[styles.gastosTitle, { color: colors.text }]}>Tus gastos</Text>
          <Text style={[styles.gastosCount, { color: colors.textSecondary }]}>
            {resumenFiltrado.cantidad} registros
          </Text>
        </View>

        <View style={[styles.gastosList, { backgroundColor: colors.surface }]}>
          {gastosFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay gastos en este mes
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Ve al Scanner para agregar gastos
              </Text>
            </View>
          ) : (
            gastosFiltrados.map((gasto, index) => (
              <GastoItem key={`${gasto.fecha}-${index}`} gasto={gasto} />
            ))
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Ir al Scanner"
            onPress={() => navigation.navigate('Scanner')}
            color="#4A90D9"
          />
        </View>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Mes</Text>
            {MESES.map(mes => (
              <TouchableOpacity
                key={mes.value}
                style={[
                  styles.modalOption,
                  selectedMonth === mes.value && { backgroundColor: colors.primary }
                ]}
                onPress={() => {
                  setSelectedMonth(mes.value);
                  setShowModal(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  { color: selectedMonth === mes.value ? '#FFFFFF' : colors.text }
                ]}>
                  {mes.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  gastosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  gastosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gastosCount: {
    fontSize: 14,
  },
  gastosList: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalOption: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 4,
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});