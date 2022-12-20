const http = require('http');
const { createHandler } = require('graphql-http/lib/use/node');

const schema = require('./schema');
const handler = createHandler({ schema });

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/graphql')) {
    handler(req, res);
  } else {
    res.writeHead(404).end();
  }
});

const PORT = 3040;
server.listen(PORT);
console.log(`Server listening on port ${PORT}...`);
