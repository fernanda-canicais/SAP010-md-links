const fs = require("fs");

// ler um arquivo md, documentação > métodos read >
const filePath = "./src/arquivos/arquivo.md";

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Erro na leitura do arquivo .md", err);
    return;
  }
  //console.log(data);
  const linksEncontrados = encontrarLinks(data);
  console.table(linksEncontrados);
});

const encontrarLinks = (data) => {
  const linkRegex = /\[([^[\]]*)\]\((https?:\/\/[^\s?#.].[^\s]*)\)/gm;
  const darMatch = [...data.matchAll(linkRegex)];

  return darMatch.map((match) => ({
    text: match[1],
    url: match[2],
    file: filePath,
  }));
};
