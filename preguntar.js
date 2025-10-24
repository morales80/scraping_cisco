const readline = require("readline");

function preguntarElemento() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    function hacerPregunta() {
      rl.question(
        "¿Qué tecnología o palabra clave deseas buscar?: ",
        (respuesta) => {
          const valor = respuesta.trim();
          if (!valor || valor.length < 2) {
            console.log("Entrada inválida, intenta de nuevo.\n");
            hacerPregunta();
          } else {
            rl.close();
            resolve(valor);
          }
        }
      );
    }

    hacerPregunta();
  });
}

module.exports = preguntarElemento;
