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
  application.get("/relatorioSeguroBradesco", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioSeguroBradesco(
      application,
      req,
      res
    );
  });
  application.get(
    "/gerarPlanilhasBradesco",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.gerarPlanilhasBradesco(
        application,
        req,
        res
      );
    }
  );

  application.patch(
    "/gerarPlanilhasRelatorios",
    /*verifyJWT,*/ function (req, res) {
      application.app.controllers.consultasSqlServer.gerarPlanilhasRelatorios(
        req,
        res
      );
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
  application.patch("/gerarPdfGenerico", function (req, res) {
    application.app.controllers.consultasSqlServer.gerarPdfGenerico(
      application,
      req,
      res
    );
  });
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

  application.get(
    "/selecionaCotasAtivasComEmail",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.selecionaCotasAtivasComEmail(
        application,
        req,
        res
      );
    }
  );

  application.get(
    "/selecionaCotasAtivasComEmailEx",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.selecionaCotasAtivasComEmailEx(
        application,
        req,
        res
      );
    }
  );

  application.get("/relatorioPerfilVendas", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioPerfilVendas(
      application,
      req,
      res
    );
  });

  application.get(
    "/relatorioVendasTabelaComissao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.relatorioVendasTabelaComissao(
        application,
        req,
        res
      );
    }
  );
  application.get("/verificacaoNacionalidade", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoNacionalidade(
      application,
      req,
      res
    );
  });
  application.get("/verificacaoNome", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoNome(
      application,
      req,
      res
    );
  });
  application.get("/verificacaoFiliacao", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoFiliacao(
      application,
      req,
      res
    );
  });
  application.get("/verificacaoDtNascimento", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoDtNascimento(
      application,
      req,
      res
    );
  });
  application.get(
    "/verificacaoLocalNascimento",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.verificacaoLocalNascimento(
        application,
        req,
        res
      );
    }
  );
  application.get("/verificacaoNumeroRg", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoNumeroRg(
      application,
      req,
      res
    );
  });
  application.get("/verificacaoDtEmissaoRg", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoDtEmissaoRg(
      application,
      req,
      res
    );
  });
  application.get(
    "/verificacaoOrgaoExpedicaoRg",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.verificacaoOrgaoExpedicaoRg(
        application,
        req,
        res
      );
    }
  );
  application.get("/verificacaoSemRendaPf", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoSemRendaPf(
      application,
      req,
      res
    );
  });
  application.get(
    "/verificacaoFirmaDenominacaoSocial",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.verificacaoFirmaDenominacaoSocial(
        application,
        req,
        res
      );
    }
  );
  application.get("/verificacaoAtivoPrincipal", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoAtivoPrincipal(
      application,
      req,
      res
    );
  });
  application.get(
    "/verificacaoDataConstituicao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.verificacaoDataConstituicao(
        application,
        req,
        res
      );
    }
  );
  application.get("/verificacaoSemRendaPj", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.verificacaoSemRendaPj(
      application,
      req,
      res
    );
  });
  application.get("/selecionaCliente", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.selecionaCliente(
      application,
      req,
      res
    );
  });
  application.get("/selecionaContatosCliente", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.selecionaContatosCliente(
      application,
      req,
      res
    );
  });
  application.get("/selecionaTabTel", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.selecionaTabTel(
      application,
      req,
      res
    );
  });
  application.get(
    "/cotasNaoContempParQuitacao",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.cotasNaoContempParQuitacao(
        application,
        req,
        res
      );
    }
  );
  application.get("/dadosCliente", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.dadosCliente(
      application,
      req,
      res
    );
  });
  application.get("/docPorCota", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.docPorCota(
      application,
      req,
      res
    );
  });
  application.get("/docPorPlaca", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.docPorPlaca(
      application,
      req,
      res
    );
  });
  application.get(
    "/cotasPagasAtrasoSemMultaJuros",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.cotasPagasAtrasoSemMultaJuros(
        application,
        req,
        res
      );
    }
  );

  application.get("/proximasAssembleias", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.proximasAssembleias(
      application,
      req,
      res
    );
  });

  application.get("/cotasCliente", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.cotasCliente(
      application,
      req,
      res
    );
  });

  application.get("/historicoCota", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.historicoCota(
      application,
      req,
      res
    );
  });
  application.get("/alienacao", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.alienacao(
      application,
      req,
      res
    );
  });
  application.get("/fasesProcessoAlienacao", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.fasesProcessoAlienacao(
      application,
      req,
      res
    );
  });
  application.get("/movimentosFinanceirosCota", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.movimentosFinanceirosCota(
      application,
      req,
      res
    );
  });
  application.get(
    "/codigosMovimentosFinanceirosCota",
    verifyJWT,
    function (req, res) {
      application.app.controllers.consultasSqlServer.codigosMovimentosFinanceirosCota(
        application,
        req,
        res
      );
    }
  );
  application.get("/relatorioValoresDevolver", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.relatorioValoresDevolver(
      application,
      req,
      res
    );
  });
  application.get("/gruposAtivos", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.gruposAtivos(
      application,
      req,
      res
    );
  });
  application.get("/telefonesCota", verifyJWT, function (req, res) {
    application.app.controllers.consultasSqlServer.telefonesCota(
      application,
      req,
      res
    );
  });
};
