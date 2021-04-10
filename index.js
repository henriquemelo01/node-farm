const fs = require("fs");
const http = require("http");
const { URL } = require("url");

// Tendo em vista que a função passada como parâmetro para o createServer é executada toda vez que o client fazer uma requisição. Não será eficiente lermos o mesmo arquivo JSON que contém os dados da aplicação na callback, assim, utiliza-se a leitura sincrona de arquivo, pois esta não sera bloquiante, já que o código é executado apenas uma unica vez quando o usuario entra na aplicação, além de facilitar o armazenamento do dado.

// Carregando todos os arquivos html da aplicação - estes são carregados na forma de strings
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempProducts = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8"); // __dirname -> caminho onde o arquivo atual esta localizado
const productsData = JSON.parse(data); // parse: JSON -> OBJECT

// Substitui os placeholders do html
const replaceTemplate = function (html, product) {
  let newHtmlCard = html.replace(/{%PRODUCTNAME%}/g, product.productName); // O operador /string/g, substitui todos os termos
  newHtmlCard = newHtmlCard.replace(/{%IMAGE%}/g, product.image);
  newHtmlCard = newHtmlCard.replace(/{%QUANTITY%}/g, product.quantity);
  newHtmlCard = newHtmlCard.replace(/{%PRICE%}/g, product.price);
  newHtmlCard = newHtmlCard.replace(/{%ID%}/g, product.id);
  newHtmlCard = newHtmlCard.replace(/{%FROM%}/g, product.from);
  newHtmlCard = newHtmlCard.replace(/{%NUTRIENTS%}/g, product.nutrients);
  newHtmlCard = newHtmlCard.replace(/{%DESCRIPTION%}/g, product.description);
  if (!product.organic)
    newHtmlCard = newHtmlCard.replace("{%NOT_ORGANIC%}", "not-organic");
  return newHtmlCard;
};

const server = http.createServer((req, res) => {
  // Routing da Aplicação

  // A partir a propriedade req.url, temos acesso qual rota foi acessada pelo usuario.
  const pathName = req.url;
  // Para acessarmos a query string da url ou seja /produtos?"id=5454" e converte-lo em objeto utiliza-se o metodo url.parse(req.url,true).

  const baseURL = `http://${req.headers.host}/`;
  const { pathname, search, searchParams } = new URL(req.url, baseURL); // req.url = /product?id=4040; pathname: /product; search: ?id=4040
  const query = Object.fromEntries(searchParams); // query {id: string}

  // Overview Page
  if (pathname === "/" || pathname === "/overview") {
    const cardsHTML = productsData
      .map((element) => replaceTemplate(tempCard, element))
      .join("");

    const newTempOverviewHTML = tempOverview.replace(
      "{%PRODUCT_CARDS%}",
      cardsHTML
    );

    // console.log(newTempOverviewHTML);
    // Envia a response ao client
    res.writeHead(200, { "Content-type": "text/html" });
    res.end(newTempOverviewHTML);

    // Products Page
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = productsData[query.id];
    const output = replaceTemplate(tempProducts, product);
    res.end(output);

    // API Page
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // Page not Found
  } else {
    res.writeHead(404, {
      "Content-type": "txt/html",
      "my-own-header": "Hello world",
    });
    res.end("<h1>Page not Found</h1>");
  }
});

// Ouvindo requisições à porta 8000 do servidor
server.listen(8000, "127.0.0.1", () => {
  console.log(
    "O servidor já esta ouvindo requisições à porta 8000 do localhost"
  );
});
