const { criarRootUser } = require("./app/utils/auth.js");
var app = require("./config/server.js");

app.listen(3030, function () {
  criarRootUser();
  console.log("Servidor online");
});
