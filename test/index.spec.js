const { lerArquivos, validarLinks } = require("../src/index");
const path = require("path");
const fs = require("fs");

describe("lerArquivos", () => {
  it("deve retornar um array vazio quando o arquivo não tem links", () => {
    return lerArquivos("./src/arquivos/vazio.md").then((result) => {
      expect(result).toEqual([]);
    });
  });

  it("deve retornar um array com informações quando o arquivo tiver links", () => {
    const filePath = path.resolve(__dirname, "../src/arquivos/arquivo.md");
    return lerArquivos(filePath).then((result) => {
      expect(result).toEqual([
        {
          text: "Google",
          url: "https://www.google.com/",
          file: filePath,
        },
        {
          text: "Laboratoria",
          url: "https://www.laboratoria.com/",
          file: filePath,
        },
      ]);
    });
  });
});

