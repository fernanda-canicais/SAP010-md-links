const fs = require("fs");
const path = require("path");
const fetch = require("cross-fetch");

function lerArquivos(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return reject(`Erro na leitura do arquivo: ${err}`);
      }

      const linkRegex = /\[([^[\]]*)\]\((https?:\/\/[^\s?#.].[^\s]*)\)/gm;
      const darMatch = [];
      let match;

      while ((match = linkRegex.exec(data)) !== null) {
        darMatch.push(match);
      }

      const linksEncontrados = darMatch.map((match) => ({
        text: match[1],
        url: match[2],
        file: filePath,
      }));

      resolve(linksEncontrados);
    });
  });
}

function lerDiretorioMd(diretorio) {
  return new Promise((resolve, reject) => {
    fs.readdir(diretorio, (err, files) => {
      if (err) {
        console.error(err);
        return reject(`Erro ao ler o diretório: ${err}`);
      }

      const listaPromessas = files
        .filter((file) => file.endsWith(".md"))
        .map((file) => lerArquivos(path.join(diretorio, file)));

      Promise.all(listaPromessas)
        .then((array) => {

          const linksEncontrados = array.flat();
          resolve(linksEncontrados);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}

function validarLinks(arrayLinks) {
  return Promise.all(
    arrayLinks.map((link) => {
      return fetch(link.url)
        .then((response) => {
         
          return {
            ...link,
            status: response.status,
            ok: response.ok ? 'ok': 'fail'
          };
        })
        .catch(() => {
          link.status = 404;
          link.ok = "FAIL";
          return {
            ...link,
          status: 404,
        ok: 'fail'};
        });
    })
  );
}

function mdLinks(path, option) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        return reject(`Erro: ${err}`);
      } else if (stats.isFile()) {
        lerArquivos(path)
          .then((links) => {
            if (option && option.validate) {
              return validarLinks(links);
            }
            return links;
          })
          .then(resolve)
          .catch(reject);
      } else if (stats.isDirectory()) {
        lerDiretorioMd(path)
          .then((links) => {
            if (option && option.validate) {
              return validarLinks(links);
            }
            return links;
          })
          .then(resolve)
          .catch(reject);
      }
    });
  });
}

module.exports = { mdLinks };
