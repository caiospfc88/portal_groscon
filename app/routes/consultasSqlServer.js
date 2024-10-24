const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/comissoesSemReducao", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.comissoesSemReducao(
      application,
      req,
      res
    );
  });
  application.get("/comissoesComReducao", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.comissoesComReducao(
      application,
      req,
      res
    );
  });
  application.get("/quitados", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.quitados(
      application,
      req,
      res
    );
  });
  application.get("/aniversariantesMes", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.aniversariantesMes(
      application,
      req,
      res
    );
  });
  application.get("/aniversariantesPeriodo", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.getAniversariantesPeriodo(
      application,
      req,
      res
    );
  });
  application.get("/relatorioRenegociacoes", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioRenegociacoes(
      application,
      req,
      res
    );
  });
  application.get("/relatorioAproveitamento", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioAproveitamento(
      application,
      req,
      res
    );
  });
  application.get("/relatorioSeguroBradescoPf", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioSeguroBradescoPf(
      application,
      req,
      res
    );
  });
  application.get("/relatorioSeguroBradescoPj", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioSeguroBradescoPj(
      application,
      req,
      res
    );
  });
  application.get(
    "/gerarPlanilhasBradescoPf",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.gerarPlanilhasBradescoPf(
        application,
        req,
        res
      );
    }
  );
  application.get(
    "/gerarPlanilhasBradescoPj",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.gerarPlanilhasBradescoPj(
        application,
        req,
        res
      );
    }
  );
  application.patch(
    "/gerarPlanilhasRelatorios",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.gerarPlanilhasRelatorios(req,res);
    }
  );
  application.get(
    "/gerarPdfComissao",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.gerarPdfComissao(
        application,
        req,
        res
      );
    }
  );
  application.get(
    "/gerarPdfComissaoDados",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.gerarPdfComissaoDados(
        application,
        req,
        res
      );
    }
  );
  application.get(
    "/selecionaPeriodoComissao",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.selecionaPeriodoComissao(
        application,
        req,
        res
      );
    }
  );
  application.get(
    "/selecionaRepresentantes",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.selecionaRepresentantes(
        application,
        req,
        res
      );
    }
  );

  application.get("/selecionaEquipes", function (req, res) {
    application.app.controllers.consultasSqlServer.selecionaEquipes(
      application,
      req,
      res
    );
  });

  application.get("/selecionaEstados", function (req, res) {
    application.app.controllers.consultasSqlServer.selecionaEstados(
      application,
      req,
      res
    );
  });

  application.get("/situacaoCotasEstado", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.situacaoCotasEstado(
      application,
      req,
      res
    );
  });

  application.get("/selecionaCotasAtivasComEmail", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.selecionaCotasAtivasComEmail(
      application,
      req,
      res
    );
  });

  application.get("/selecionaCotasAtivasComEmailEx", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.selecionaCotasAtivasComEmailEx(
      application,
      req,
      res
    );
  });

  application.get("/relatorioPerfilVendas", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioPerfilVendas(
      application,
      req,
      res
    );
  });
};
