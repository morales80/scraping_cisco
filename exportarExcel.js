const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

function exportarDatosExcel(datos, nombreArchivo="resultados.xlsx", carpetaDestino="./output", nombreHoja="datos") {
  if (!Array.isArray(datos) || datos.length === 0) return;

  if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino, { recursive: true });

  const ruta = path.join(carpetaDestino, nombreArchivo);
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  XLSX.writeFile(wb, ruta);
  console.log(`Archivo Excel creado: ${ruta}`);
}

module.exports = exportarDatosExcel;
