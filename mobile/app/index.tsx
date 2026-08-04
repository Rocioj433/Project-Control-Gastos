import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { getResumen } from "../services/api";
import { COLORS, CATEGORY_COLORS } from "../services/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface CategoriaResumen {
  categoria: string;
  color: string;
  icon: string;
  total: number;
  cantidad: number;
  porcentaje: number;
}

export default function HomeScreen() {
  const [resumen, setResumen] = useState<CategoriaResumen[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadResumen();
  }, []);

  const loadResumen = async () => {
    try {
      const data = await getResumen();
      setResumen(data.por_categoria);
      setTotal(data.total_general);
    } catch (error) {
      console.log("Error cargando resumen");
    }
  };

  const renderPieChart = () => {
    if (resumen.length === 0) return null;

    const size = 200;
    const center = size / 2;
    const radius = 80;
    let currentAngle = 0;

    const slices = resumen.map((cat, index) => {
      const angle = (cat.porcentaje / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      const color = CATEGORY_COLORS[cat.categoria] || COLORS.textLight;

      return (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: color }]} />
          <Text style={styles.legendText}>{cat.categoria}</Text>
          <Text style={styles.legendPercent}>{cat.porcentaje}%</Text>
        </View>
      );
    });

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Distribucion de Gastos</Text>
        <View style={styles.chartRow}>
          <View style={styles.pieChartWrapper}>
            <View style={[styles.pieChart, { width: size, height: size }]}>
              {resumen.map((cat, index) => {
                const angle = (cat.porcentaje / 100) * 360;
                const color = CATEGORY_COLORS[cat.categoria] || COLORS.textLight;
                const rotation = resumen
                  .slice(0, index)
                  .reduce((acc, c) => acc + (c.porcentaje / 100) * 360, 0);

                return (
                  <View
                    key={index}
                    style={[
                      styles.pieSlice,
                      {
                        width: size,
                        height: size,
                        backgroundColor: color,
                        transform: [{ rotate: `${rotation}deg` }],
                      },
                    ]}
                  />
                );
              })}
              <View style={styles.pieCenter}>
                <Text style={styles.pieCenterLabel}>Total</Text>
                <Text style={styles.pieCenterAmount}>
                  ${total.toLocaleString("es-AR")}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.legendContainer}>{slices}</View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Mis Finanzas</Text>
        <Text style={styles.subtitle}>Resumen del mes</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total del Mes</Text>
        <Text style={styles.totalAmount}>
          ${total.toLocaleString("es-AR")}
        </Text>
        <View style={styles.totalDivider} />
        <View style={styles.totalStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{resumen.length}</Text>
            <Text style={styles.statLabel}>Categorias</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {resumen.reduce((acc, c) => acc + c.cantidad, 0)}
            </Text>
            <Text style={styles.statLabel}>Gastos</Text>
          </View>
        </View>
      </View>

      {renderPieChart()}

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acciones Rapidas</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: "#EEF2FF" }]}
            onPress={() => router.push("/upload")}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionText}>Subir PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: "#F0FDF4" }]}
            onPress={() => router.push("/gastos")}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>Ver Gastos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: "#FFF7ED" }]}
            onPress={() => router.push("/resumen")}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Reportes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#C7D2FE",
    marginTop: 4,
  },
  totalCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    marginTop: -12,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 4,
  },
  totalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  totalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pieChartWrapper: {
    alignItems: "center",
  },
  pieChart: {
    position: "relative",
  },
  pieSlice: {
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: 100,
    opacity: 0.85,
  },
  pieCenter: {
    position: "absolute",
    top: 60,
    left: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  pieCenterLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  pieCenterAmount: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 2,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  quickActions: {
    margin: 16,
    marginTop: 0,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
});
