const { lerArquivos, validarLinks, lerDiretorioMd, mdLinks } = require("../src/index");
const path = require("path");

describe("lerArquivos", () => {
  it("deve retornar um array vazio quando o arquivo não tem links", () => {
    return lerArquivos("./src/arquivos/vazio.md").then((result) => {
      expect(result).toEqual([]);
    });
  });

  it("deve retornar o erro quando o caminho do arquivo for inválido", () => {
    const invalidPath = "caminho-invalido.md";
    return expect(lerArquivos(invalidPath)).rejects.toThrowError(
      "ENOENT: no such file or directory, open 'C:\\Users\\Matheus Tramonte\\SAP010-md-links\\caminho-invalido.md'"
    );
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

describe("validarLinks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve checar se o link é status 200 e retornar iterando na array', async () => {
    const link = { url: 'https://www.google.com/' };
    const mockFetch = jest.fn().mockResolvedValueOnce({
      status: 200,
      ok: true,
    });

    global.fetch = mockFetch;

    const resultado = await validarLinks([link]);

    expect(resultado).toEqual([
      {
        ...link,
        status: 200,
        ok: 'ok',
      },
    ]);
  });

  it('deve checar se o link é 404 e retornar fail iterando na array', async () => {
    const link = { url: 'https:xxxxGoogle.com.br'};
    const mockFetch = jest.fn().mockRejectedValueOnce({
      status: 404,
    });

    global.fetch = mockFetch;

    const resultado = await validarLinks([link]);

    expect(resultado).toEqual([
      {
        ...link,
        status: 404,
        ok: 'fail',
      },
    ]);
  });
});

describe("lerDiretorioMd", () => {
  it("deve retornar um array com informações dos links encontrados nos arquivos do diretório", async () => {
    const directoryPath = path.resolve(__dirname, "../src/arquivos");
    const expectedLinks = [
      {
        text: "Google",
        url: "https://www.google.com/",
        file: path.resolve(__dirname, "../src/arquivos/arquivo.md"),
      },
      {
        text: "Laboratoria",
        url: "https://www.laboratoria.com/",
        file: path.resolve(__dirname, "../src/arquivos/arquivo.md"),
      },
    ];

    try {
      const result = await lerDiretorioMd(directoryPath);
      expect(result).toEqual(expectedLinks);
    } catch (error) {
      fail(error);
    }
  });

  it("deve retornar um array vazio quando o arquivo não contém links", async () => {
    const filePath = path.resolve(__dirname, "../src/arquivos/vazio.md");

    try {
      const result = await lerArquivos(filePath);
      expect(result).toEqual([]);
    } catch (error) {
      fail(error);
    }
  });

  it("deve retornar um erro quando o diretório não existe", async () => {
    const invalidPath = "caminho-invalido";

    try {
      await lerDiretorioMd(invalidPath);
      fail("Deveria ter lançado um erro");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("mdLinks", () => {
  beforeEach(() => {
    const mockFetch = jest.fn().mockImplementation((url) => {
      if (url === 'https://www.google.com/') {
        return fetchMockResponse(200, true);
      } else if (url === 'https:xxxxGoogle.com.br') {
        return fetchMockResponse(404, false);
      }
    });

    global.fetch = mockFetch;
  });

  it("deve retornar os links de um diretório existente com validação", (done) => {
    const directoryPath = path.resolve(__dirname, "../src/arquivos");
    const expectedLinks = [
      {
        url: "https://www.google.com/",
        text: "Google",
        file: path.resolve(__dirname, "../src/arquivos/arquivo.md"),
        status: 200,
        ok: "ok",
      },
      {
        url: "https://www.laboratoria.com/",
        text: "Laboratoria",
        file: path.resolve(__dirname, "../src/arquivos/arquivo.md"),
        status: 200,
        ok: "ok",
      },
    ];

    mdLinks(directoryPath, { validate: true }).then((result) => {
      expect(result).toEqual(expectedLinks);
      done();
    });
  });

  it("deve retornar os links de um arquivo existente com validação", (done) => {
    const filePath = path.resolve(__dirname, "../src/arquivos/arquivo.md");
    const expectedLinks = [
      {
        url: 'https://www.google.com/',
        text: 'Google',
        file: filePath,
        status: 200,
        ok: 'ok',
      },
      {
        url: 'https://www.laboratoria.com/',
        text: 'Laboratoria',
        file: filePath,
        status: 200,
        ok: 'ok',
      },
    ];

    mdLinks(filePath, { validate: true }).then((result) => {
      expect(result).toEqual(expectedLinks);

      const validLinks = result.filter((link) => link.status === 200);
      expect(validLinks).toEqual(expectedLinks);
      done();
    });
  });

  it("deve retornar os links de um arquivo existente sem validação", (done) => {
    const filePath = path.resolve(__dirname, "../src/arquivos/arquivo.md");
    const expectedLinks = [
      {
        url: 'https://www.google.com/',
        text: 'Google',
        file: filePath,
      },
      {
        url: 'https://www.laboratoria.com/',
        text: 'Laboratoria',
        file: filePath,
      },
    ];

    mdLinks(filePath, { validate: false }).then((result) => {
      expect(result).toEqual(expectedLinks);
      done();
    });
  });

  it("deve retornar um array vazio para um arquivo sem links", (done) => {
    const filePath = path.resolve(__dirname, "../src/arquivos/vazio.md");

    mdLinks(filePath).then((result) => {
      expect(result).toEqual([]);
      done();
    });
  });

  it("deve retornar um erro quando o arquivo não existe", (done) => {
    const invalidPath = "caminho-invalido";

    mdLinks(invalidPath, { validate: true }).catch((error) => {
      expect(error).toBeDefined();
      done();
    });
  });

  it("deve retornar um erro quando o diretório não existe", (done) => {
    const invalidPath = "caminho-invalido";

    mdLinks(invalidPath, { validate: true }).catch((error) => {
      expect(error).toBeDefined();
      done();
    });
  });
});

