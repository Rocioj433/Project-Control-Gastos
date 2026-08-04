import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { getResumen, getReporteMensual } from "../services/api";
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

export default function ResumenScreen() {
  const [resumen, setResumen] = useState<CategoriaResumen[]>([]);
  const [total, setTotal] = useState(0);
  const [reporte, setReporte] = useState<any>(null);

  useEffect(() => {
    loadResumen();
    loadReporte();
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

  const loadReporte = async () => {
    try {
      const data = await getReporteMensual("2026-02");
      setReporte(data);
    } catch (error) {
      console.log("Error cargando reporte");
    }
  };

  const renderPieChart = () => {
    if (resumen.length === 0) return null;

    const size = 220;
    const sorted = [...resumen].sort((a, b) => b.porcentaje - a.porcentaje);

    return (
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Gastos por Categoria</Text>

        <View style={styles.pieContainer}>
          <View style={styles.pieWrapper}>
            {sorted.map((cat, index) => {
              const color = CATEGORY_COLORS[cat.categoria] || COLORS.textLight;
              const sizePercent = 40 + (cat.porcentaje / 100) * 60;

              return (
                <View
                  key={index}
                  style={[
                    styles.pieRing,
                    {
                      width: sizePercent,
                      height: sizePercent,
                      borderColor: color,
                      zIndex: sorted.length - index,
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

        <View style={styles.legendGrid}>
          {sorted.map((cat, index) => {
            const color = CATEGORY_COLORS[cat.categoria] || COLORS.textLight;

            return (
              <View key={index} style={styles.legendItem}>
                <View style={styles.legendLeft}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendName}>{cat.categoria}</Text>
                </View>
                <View style={styles.legendRight}>
                  <Text style={styles.legendAmount}>
                    ${cat.total.toLocaleString("es-AR")}
                  </Text>
                  <Text style={styles.legendPercent}>{cat.porcentaje}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderReporte = () => {
    if (!reporte) return null;

    return (
      <View style={styles.reportCard}>
        <Text style={styles.cardTitle}>Reporte Febrero 2026</Text>

        <View style={styles.reportStats}>
          <View style={styles.reportStatItem}>
            <Text style={styles.reportStatValue}>
              ${reporte.total.toLocaleString("es-AR")}
            </Text>
            <Text style={styles.reportStatLabel}>Total</Text>
          </View>
          <View style={styles.reportStatItem}>
            <Text style={styles.reportStatValue}>
              ${reporte.promedio_diario.toLocaleString("es-AR")}
            </Text>
            <Text style={styles.reportStatLabel}>Promedio/dia</Text>
          </View>
          <View style={styles.reportStatItem}>
            <Text style={styles.reportStatValue}>{reporte.dias_con_gastos}</Text>
            <Text style={styles.reportStatLabel}>Dias con gastos</Text>
          </View>
        </View>

        {reporte.total_anterior > 0 && (
          <View style={styles.variationBox}>
            <Text style={styles.variationLabel}>vs mes anterior</Text>
            <Text
              style={[
                styles.variationValue,
                { color: reporte.variacion > 0 ? COLORS.error : COLORS.success },
              ]}
            >
              {reporte.variacion > 0 ? "+" : ""}
              {reporte.variacion}%
            </Text>
          </View>
        )}

        {reporte.top_gastos && reporte.top_gastos.length > 0 && (
          <View style={styles.topGastos}>
            <Text style={styles.topGastosTitle}>Mayores gastos</Text>
            {reporte.top_gastos.map((g: any, i: number) => (
              <View key={i} style={styles.topGastoItem}>
                <View style={styles.topGastoLeft}>
                  <Text style={styles.topGastoRank}>#{i + 1}</Text>
                  <View>
                    <Text style={styles.topGastoDesc} numberOfLines={1}>
                      {g.description}
                    </Text>
                    <Text style={styles.topGastoDate}>{g.date}</Text>
                  </View>
                </View>
                <Text style={styles.topGastoAmount}>
                  ${g.amount.toLocaleString("es-AR")}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen</Text>
        <Text style={styles.headerSubtitle}>Analisis de tus gastos</Text>
      </View>

      {renderPieChart()}
      {renderReporte()}

      <View style={styles.bottomPadding} />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#C7D2FE",
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    marginTop: -8,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  pieContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  pieWrapper: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  pieRing: {
    position: "absolute",
    borderRadius: 100,
    borderWidth: 20,
    opacity: 0.85,
  },
  pieCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pieCenterLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pieCenterAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 2,
  },
  legendGrid: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendName: {
    fontSize: 14,
    color: COLORS.text,
  },
  legendRight: {
    alignItems: "flex-end",
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  legendPercent: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  reportCard: {
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
  reportStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  reportStatItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  reportStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  reportStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  variationBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  variationLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  variationValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  topGastos: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  topGastosTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  topGastoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topGastoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  topGastoRank: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    width: 24,
  },
  topGastoDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  topGastoDate: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  topGastoAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  bottomPadding: {
    height: 20,
  },
});
