import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SummaryCardProps {
  totalPesos: number;
  totalUSD: number;
  cantidad: number;
  mes: string;
}

export default function SummaryCard({ totalPesos, totalUSD, cantidad, mes }: SummaryCardProps) {
  const { colors } = useTheme();

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(valor);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.header}>
        <Text style={styles.mesLabel}>{mes}</Text>
        <Text style={styles.cantidad}>{cantidad} gastos</Text>
      </View>
      
      <Text style={styles.totalLabel}>Total gastado</Text>
      <Text style={styles.totalPesos}>{formatMoneda(totalPesos)}</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.usdRow}>
        <Text style={styles.usdLabel}>Gastos en USD</Text>
        <Text style={styles.usdValue}>US$ {totalUSD.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
  },
  cantidad: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  totalPesos: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 15,
  },
  usdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usdLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  usdValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
});