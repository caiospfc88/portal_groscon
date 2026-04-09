// src/controllers/historicoRecuperacao.js
const models = require("../../db/models");

module.exports.listarHistorico = async function (req, res) {
  try {
    var historico = await models.historico_recuperacao.findAll({
      include: [
        {
          model: models.usuarios,
          as: "agente",
          attributes: ["id", "nome"],
        },
      ],
    });
    res.send(historico);
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao listar histórico", error: error.message });
  }
};

module.exports.statusEmLote = async function (req, res) {
  try {
    const { ids_cotas } = req.body;
    if (!ids_cotas || !ids_cotas.length) return res.send([]);

    // Busca apenas a última interação de cada cota solicitada
    const historicos = await models.historico_recuperacao.findAll({
      where: { id_cota: ids_cotas },
      order: [["createdAt", "DESC"]],
    });

    // Filtra para manter apenas o status mais recente de cada id_cota
    const statusRecentes = [];
    const map = new Set();
    for (let h of historicos) {
      if (!map.has(h.id_cota)) {
        statusRecentes.push({
          id_cota: h.id_cota,
          status_acordo: h.status_acordo,
        });
        map.add(h.id_cota);
      }
    }

    res.send(statusRecentes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.atualizarHistorico = async function (req, res) {
  try {
    const id = req.params.id;
    const { status_acordo, observacao } = req.body;

    await models.historico_recuperacao.update(
      { status_acordo, observacao },
      { where: { id: id } },
    );

    res.status(200).json({ Msg: "Atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ Msg: "Erro ao atualizar", error: error.message });
  }
};

module.exports.consultarHistorico = async function (req, res) {
  try {
    var historico = await models.historico_recuperacao.findOne({
      where: { id: req.query.id },
    });
    res.send(historico);
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao consultar histórico", error: error.message });
  }
};

module.exports.cadastrarHistorico = async function (req, res) {
  try {
    // Se o multer salvou o arquivo, req.file existirá e teremos o caminho
    const caminhoAudio = req.file ? req.file.filename : null;

    var historico = await models.historico_recuperacao.create({
      id_cota: req.body.id_cota,
      agente_id: req.body.agente_id,
      canal_contato: req.body.canal_contato,
      situacao_cota_no_contato: req.body.situacao_cota_no_contato,
      status_acordo: req.body.status_acordo,
      observacao: req.body.observacao,
      id_envio_email: req.body.id_envio_email,
      caminho_audio: caminhoAudio, // <--- Salva o caminho final no banco!
    });

    res.json({ Historico: historico.id, Msg: "Registrado com sucesso!" });
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao cadastrar histórico", error: error.message });
  }
};

module.exports.alterarHistorico = async function (req, res) {
  try {
    var historico = await models.historico_recuperacao.findOne({
      where: { id: req.body.id },
    });
    if (historico) {
      await historico.update(req.body);
      res.json({ Historico: historico, Msg: "Atualizado com sucesso!" });
    } else {
      res.status(404).json({ Msg: "Registro não encontrado." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao alterar histórico", error: error.message });
  }
};

module.exports.excluirHistorico = async function (req, res) {
  try {
    var historico = await models.historico_recuperacao.findOne({
      where: { id: req.body.id },
    });
    if (historico) {
      await historico.destroy();
      res.json({ Msg: "Excluído com sucesso!" });
    } else {
      res.status(404).json({ Msg: "Registro não encontrado." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ Msg: "Erro ao excluir histórico", error: error.message });
  }
};
