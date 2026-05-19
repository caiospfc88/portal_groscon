// app/routes/leads.js
const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarLeads", verifyJWT, function (req, res) {
    application.app.controllers.leads.listarLeads(req, res);
  });

  application.get("/listarEncaminhamentos", verifyJWT, function (req, res) {
    application.app.controllers.leads.listarEncaminhamentos(req, res);
  });

  application.post("/cadastrarLead", verifyJWT, function (req, res) {
    application.app.controllers.leads.cadastrarLead(req, res);
  });

  application.put("/alterarLead", verifyJWT, function (req, res) {
    application.app.controllers.leads.alterarLead(req, res);
  });

  application.delete("/excluirLead", verifyJWT, function (req, res) {
    application.app.controllers.leads.excluirLead(req, res);
  });
};
