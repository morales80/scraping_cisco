const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const readlineSync = require("readline-sync");

(async () => {
  // Pedir palabra clave
  const keyword = readlineSync.question(
    "¿Qué tecnología o palabra clave deseas buscar?: "
  );
  const url = `https://developer.cisco.com/docs/search/?q=${encodeURIComponent(
    keyword
  )}`;

  console.log(`\n Buscando proyectos relacionados con "${keyword}"...\n`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  let proyectos = [];
  let paginaActual = 1;
  let btnSiguienteActivo = true;

  while (btnSiguienteActivo) {
    console.log(`Página ${paginaActual} cargada. Extrayendo datos...`);

    // Extraer proyectos de la página actual
    const proyectosPagina = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".card__title")).map((el) => {
        const card = el.closest("a.card");
        const titulo = el.innerText.trim();
        const link = card ? card.href : "No disponible";
        const descripcion = card
          ? card.querySelector(".card__description")?.innerText.trim() ||
            "No disponible"
          : "No disponible";
        return { titulo, descripcion, link };
      });
    });

    proyectos.push(...proyectosPagina);

    // Revisar si la flecha derecha existe y no está deshabilitada
    btnSiguienteActivo = await page.evaluate(() => {
      const flecha = document.querySelector(
        ".circle-arrow.circle-arrow--right"
      );
      if (flecha && !flecha.classList.contains("circle-arrow--disabled")) {
        flecha.click();
        return true;
      }
      return false;
    });

    if (btnSiguienteActivo) {
      paginaActual++;
      // Esperar a que carguen las nuevas cards
      await page.waitForSelector(".card__title", { timeout: 10000 });
    }
  }

  await browser.close();

  // Crear carpeta output si no existe
  const outputDir = "./output";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // Guardar JSON
  fs.writeFileSync(
    path.join(outputDir, "proyectosCisco.json"),
    JSON.stringify(proyectos, null, 2),
    "utf-8"
  );

  // Guardar XLSX
  const ws = xlsx.utils.json_to_sheet(proyectos);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Proyectos");
  xlsx.writeFile(wb, path.join(outputDir, "proyectosCisco.xlsx"));

  // Guardar CSV
  const csv = xlsx.utils.sheet_to_csv(ws);
  fs.writeFileSync(path.join(outputDir, "proyectosCisco.csv"), csv, "utf-8");

  console.log(
    `\n Scraping finalizado. Total de proyectos: ${proyectos.length}`
  );
  console.log(`Archivos guardados en la carpeta ./output`);
})();
