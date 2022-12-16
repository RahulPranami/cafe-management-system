require("dotenv").config();
const http = require("http");
const App = require("./index");

const server = http.createServer(App);

server.listen(process.env.PORT);
