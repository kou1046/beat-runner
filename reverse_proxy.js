const fs = require("fs");
const https = require("https");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({
  target: {
    host: "133.62.185.133",
    port: 3000,
  },
});

const web = (req, res) => {
  proxy.web(req, res);
};

const ws = (req, socket, head) => {
  proxy.ws(req, socket, head);
};

const server = https.createServer(
  {
    key: fs.readFileSync("133.62.185.133-key.pem"),
    cert: fs.readFileSync("133.62.185.133.pem"),
  },
  web
);

server.on("upgrade", ws);

server.listen(3100, "133.62.185.133", () => {
  console.log(
    `proxy server has started listening on https://133.62.185.133:3100, forwarding to http://133.62.185.133:3000`
  );
});
