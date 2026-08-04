import axios from "axios";
import { Platform } from "react-native";

const API_URL = Platform.select({
  web: "http://localhost:8000",
  default: "http://192.168.0.103:8000",
});

const api = axios.create({
  baseURL: API_URL,
});

export async function uploadPDF(file: File | string, fileName: string) {
  const formData = new FormData();

  if (typeof file === "string") {
    formData.append("file", {
      uri: file,
      name: fileName,
      type: "application/pdf",
    } as any);
  } else {
    formData.append("file", file);
  }

  const response = await api.post("/procesar-resumen/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getGastos(month?: string, category?: string) {
  const params: Record<string, string> = {};
  if (month) params.month = month;
  if (category) params.category = category;

  const response = await api.get("/gastos/", { params });
  return response.data;
}

export async function getResumen() {
  const response = await api.get("/resumen/");
  return response.data;
}

export async function exportarExcel(month?: string) {
  const params: Record<string, string> = {};
  if (month) params.month = month;

  const response = await api.get("/exportar-excel/", {
    params,
    responseType: "blob",
  });
  return response.data;
}

export async function syncToSheets(spreadsheetId: string, month?: string) {
  const params: Record<string, string> = {
    spreadsheet_id: spreadsheetId,
  };
  if (month) params.month = month;

  const response = await api.post("/sincronizar-sheets/", null, { params });
  return response.data;
}

export async function getReporteMensual(month: string) {
  const response = await api.get("/reporte-mensual/", {
    params: { month },
  });
  return response.data;
}
