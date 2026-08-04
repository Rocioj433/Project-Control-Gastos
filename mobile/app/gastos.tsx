import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { getGastos } from "../services/api";
import { COLORS, CATEGORY_COLORS } from "../services/theme";

interface Gasto {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  source: string;
}

export default function GastosScreen() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [total, setTotal] = useState(0);
  const [filtro, setFiltro] = useState<string | null>(null);

  useEffect(() => {
    loadGastos();
  }, [filtro]);

  const loadGastos = async () => {
    try {
      const data = await getGastos(undefined, filtro || undefined);
      setGastos(data.gastos);
      setTotal(data.total);
    } catch (error) {
      console.log("Error cargando gastos");
    }
  };

  const categorias = [
    "Supermercado",
    "Transporte",
    "Entretenimiento",
    "Restaurantes",
    "Salud",
    "Servicios",
    "Otros",
  ];

  const totalMonto = gastos.reduce((acc, g) => acc + g.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Gastos</Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatText}>
            {total} gasto{total !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.headerStatDivider}>|</Text>
          <Text style={styles.headerStatText}>
            ${totalMonto.toLocaleString("es-AR")}
          </Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[null, ...categorias]}
          keyExtractor={(item) => item || "all"}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                filtro === item && styles.filterActive,
              ]}
              onPress={() => setFiltro(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  filtro === item && styles.filterTextActive,
                ]}
              >
                {item || "Todos"}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const catColor = CATEGORY_COLORS[item.category] || COLORS.textLight;

          return (
            <View style={styles.gastoCard}>
              <View style={[styles.gastoAccent, { backgroundColor: catColor }]} />
              <View style={styles.gastoContent}>
                <View style={styles.gastoLeft}>
                  <View style={styles.gastoInfo}>
                    <Text style={styles.gastoDescription} numberOfLines={1}>
                      {item.description}
                    </Text>
                    <Text style={styles.gastoDate}>{item.date}</Text>
                  </View>
                </View>
                <View style={styles.gastoRight}>
                  <Text style={styles.gastoAmount}>
                    ${item.amount.toLocaleString("es-AR")}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: catColor + "20" }]}>
                    <Text style={[styles.categoryText, { color: catColor }]}>
                      {item.category}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No hay gastos para mostrar</Text>
            <Text style={styles.emptySubtext}>
              Sube un resumen de tarjeta para empezar
            </Text>
          </View>
        }
      />
    </View>
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
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  headerStatText: {
    fontSize: 14,
    color: "#C7D2FE",
  },
  headerStatDivider: {
    fontSize: 14,
    color: "#818CF8",
  },
  filtersContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  gastoCard: {
    backgroundColor: COLORS.surface,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gastoAccent: {
    width: 4,
  },
  gastoContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  gastoLeft: {
    flex: 1,
  },
  gastoInfo: {
    flex: 1,
  },
  gastoDescription: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  gastoDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  gastoRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  gastoAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
});
