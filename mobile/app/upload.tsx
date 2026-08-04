import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { uploadPDF, syncToSheets } from "../services/api";
import { COLORS } from "../services/theme";

const SPREADSHEET_ID = "1TMiklZANh00B4PW-q61svl3qec4_Tlyq76RZ5xXbiN0";

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Por favor, selecciona un archivo PDF");
      return;
    }

    setFileName(file.name);
    setError(null);
    setSyncStatus("idle");
    setLoading(true);

    try {
      const data = await uploadPDF(file, file.name);
      setResult(data);
    } catch (err: any) {
      console.log("Error:", err);
      setError("No se pudo procesar el archivo. Verifica que el backend este corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus("idle");

    try {
      await syncToSheets(SPREADSHEET_ID);
      setSyncStatus("success");
    } catch (err: any) {
      console.log("Error sync:", err);
      setSyncStatus("error");
    } finally {
      setSyncing(false);
    }
  };

  const triggerFileInput = () => {
    if (Platform.OS === "web" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cargar Resumen</Text>
        <Text style={styles.headerSubtitle}>
          Sube tu resumen de tarjeta para analizar tus gastos
        </Text>
      </View>

      <View style={styles.uploadCard}>
        <View style={styles.uploadIconContainer}>
          <Text style={styles.uploadIcon}>📄</Text>
        </View>
        <Text style={styles.uploadTitle}>Seleccionar PDF</Text>
        <Text style={styles.uploadDescription}>
          Busca el archivo PDF de tu resumen de tarjeta de credito
        </Text>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={triggerFileInput}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.buttonText}>Procesando...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {fileName ? "Seleccionar otro PDF" : "Seleccionar archivo"}
            </Text>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultIcon}>✅</Text>
            <Text style={styles.resultTitle}>Procesamiento completo</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statBox, styles.statTotal]}>
              <Text style={styles.statNumber}>{result.total_en_pdf}</Text>
              <Text style={styles.statLabel}>En el PDF</Text>
            </View>
            <View style={[styles.statBox, styles.statNew]}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>
                {result.nuevos}
              </Text>
              <Text style={styles.statLabel}>Nuevos</Text>
            </View>
            <View style={[styles.statBox, styles.statDup]}>
              <Text style={[styles.statNumber, { color: COLORS.warning }]}>
                {result.duplicados}
              </Text>
              <Text style={styles.statLabel}>Duplicados</Text>
            </View>
          </View>

          {result.nuevos > 0 && (
            <View style={styles.gastosPreview}>
              <Text style={styles.sectionTitle}>Gastos nuevos</Text>
              {result.gastos?.slice(0, 3).map((g: any, i: number) => (
                <View key={i} style={styles.gastoItem}>
                  <View style={styles.gastoLeft}>
                    <View style={styles.gastoDot} />
                    <View>
                      <Text style={styles.gastoDesc} numberOfLines={1}>
                        {g.description}
                      </Text>
                      <Text style={styles.gastoDate}>{g.date}</Text>
                    </View>
                  </View>
                  <View style={styles.gastoRight}>
                    <Text style={styles.gastoAmount}>
                      ${g.amount.toLocaleString("es-AR")}
                    </Text>
                    <Text style={styles.gastoCategory}>{g.category}</Text>
                  </View>
                </View>
              ))}
              {result.gastos?.length > 3 && (
                <Text style={styles.moreText}>
                  +{result.gastos.length - 3} gastos mas
                </Text>
              )}
            </View>
          )}

          {result.duplicados > 0 && (
            <View style={styles.dupInfo}>
              <Text style={styles.dupIcon}>⚠️</Text>
              <Text style={styles.dupText}>
                {result.duplicados} gasto{result.duplicados !== 1 ? "s" : ""} ya
                existia{result.duplicados !== 1 ? "n" : ""} en la base
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.syncButtonText}>Sincronizando...</Text>
              </View>
            ) : (
              <Text style={styles.syncButtonText}>📊 Sincronizar con Google Sheets</Text>
            )}
          </TouchableOpacity>

          {syncStatus === "success" && (
            <View style={styles.toast}>
              <Text style={styles.toastIcon}>✅</Text>
              <Text style={styles.toastText}>Sincronizado correctamente</Text>
            </View>
          )}

          {syncStatus === "error" && (
            <View style={[styles.toast, styles.toastError]}>
              <Text style={styles.toastIcon}>❌</Text>
              <Text style={[styles.toastText, { color: COLORS.error }]}>
                Error al sincronizar
              </Text>
            </View>
          )}
        </View>
      )}
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
  uploadCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    marginTop: -8,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 40,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    flex: 1,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  resultIcon: {
    fontSize: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statTotal: {
    backgroundColor: "#F1F5F9",
  },
  statNew: {
    backgroundColor: "#F0FDF4",
  },
  statDup: {
    backgroundColor: "#FFFBEB",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  gastosPreview: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  gastoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gastoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  gastoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  gastoDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
    width: 150,
  },
  gastoDate: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  gastoRight: {
    alignItems: "flex-end",
  },
  gastoAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  gastoCategory: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 2,
  },
  moreText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 12,
  },
  dupInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  dupIcon: {
    fontSize: 14,
  },
  dupText: {
    fontSize: 12,
    color: COLORS.warning,
    flex: 1,
  },
  syncButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  toastError: {
    backgroundColor: "#FEF2F2",
  },
  toastIcon: {
    fontSize: 14,
  },
  toastText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: "500",
  },
});
