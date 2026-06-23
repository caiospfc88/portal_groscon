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

  // NOVA ROTA: Adicionar anotações ao histórico do lead
  application.post("/adicionarHistoricoLead", verifyJWT, function (req, res) {
    application.app.controllers.leads.adicionarHistorico(req, res);
  });

  // NOVA ROTA: WEBHOOK DO SITE (Sem verifyJWT!)
  // Endpoint: https://recoil-taking-colt.ngrok-free.dev/webhooks/leads-site
  application.post("/webhooks/leads-site", function (req, res) {
    application.app.controllers.leads.receberLeadSite(req, res);
  });
  application.get("/listarGestores", verifyJWT, (req, res) =>
    application.app.controllers.gestores.listarGestores(req, res),
  );
  application.post("/salvarGestor", verifyJWT, (req, res) =>
    application.app.controllers.gestores.salvarGestor(req, res),
  );
  application.delete("/excluirGestor", verifyJWT, (req, res) =>
    application.app.controllers.gestores.excluirGestor(req, res),
  );
};
