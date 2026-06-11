import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Gasto } from '../utils/pdfParser';

interface GastoItemProps {
  gasto: Gasto;
}

export default function GastoItem({ gasto }: GastoItemProps) {
  const { colors } = useTheme();

  const formatMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const getIcon = (descripcion: string): string => {
    const desc = descripcion.toLowerCase();
    if (desc.includes('mercadopago') || desc.includes('mepa')) return '📱';
    if (desc.includes('google')) return '🔍';
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('disney')) return '🎬';
    if (desc.includes('uber') || desc.includes('rides')) return '🚗';
    if (desc.includes('store') || desc.includes('apple')) return '🍎';
    if (desc.includes('amazon')) return '📦';
    if (desc.includes('café') || desc.includes('restaurant') || desc.includes('mcdo')) return '🍔';
    if (desc.includes('farmacia') || desc.includes('pharmacy')) return '💊';
    if (desc.includes('supermercado') || desc.includes('super')) return '🛒';
    if (desc.includes('personal') || desc.includes('telefono')) return '📱';
    return '💳';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon(gasto.descripcion)}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.descripcion, { color: colors.text }]} numberOfLines={1}>
          {gasto.descripcion}
        </Text>
        <Text style={[styles.fecha, { color: colors.textSecondary }]}>{gasto.fecha}</Text>
      </View>
      
      <View style={styles.montos}>
        <Text style={[styles.monto, { color: colors.danger }]}>
          -{formatMoneda(gasto.monto)}
        </Text>
        {gasto.montoUSD && (
          <Text style={[styles.montoUSD, { color: colors.accent }]}>
            US${gasto.montoUSD.toFixed(2)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  descripcion: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  fecha: {
    fontSize: 12,
  },
  montos: {
    alignItems: 'flex-end',
  },
  monto: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  montoUSD: {
    fontSize: 12,
    marginTop: 2,
  },
});