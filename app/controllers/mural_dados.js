const models = require("../../db/models");
const { Op } = require("sequelize");

module.exports.listarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findAll();
  res.send(dados);
};

module.exports.listarDadosMuralAnualSemestre1 = async function (req, res) {
  var dados = await models.mural_dados.findAll({
    where: { ano: req.query.ano, mes: { [Op.lte]: 6 } },
  });
  res.send(dados);
};

module.exports.listarDadosMuralAnualSemestre2 = async function (req, res) {
  var dados = await models.mural_dados.findAll({
    where: { ano: req.query.ano, mes: { [Op.gt]: 6 } },
  });
  res.send(dados);
};

module.exports.consultarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findOne({
    where: { id: req.query.id },
  });
  res.send(dados);
};

module.exports.cadastrarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.create({
    ano: req.body.ano,
    mes: req.body.mes,
    valor: req.body.valor,
    id_mural_descricao: req.body.id_mural_descricao,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  res.json({ Dados: dados, Msg: "Cadastrada com sucesso!" });
};
module.exports.alterarDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findOne({ where: req.body.id });
  dados.update(req.body);
  res.json({ Dados: dados, Msg: "Atualizado com sucesso!" });
};
module.exports.excluirDadosMural = async function (req, res) {
  var dados = await models.mural_dados.findOne({ where: req.body.id });
  dados.destroy();
  res.json({ Dados: dados, Msg: "Excluido com sucesso!" });
};

module.exports.filtrarDadosMural = async function (req, res) {
  try {
    const { anos, meses, id_mural_descricao } = req.body;
    console.log("params: ", anos, meses, id_mural_descricao);
    if (!Array.isArray(anos) || !Array.isArray(meses) || !id_mural_descricao) {
      return res.status(400).json({ Msg: "Parâmetros inválidos." });
    }

    const dados = await models.mural_dados.findAll({
      attributes: ["ano", "mes", "valor"],
      where: {
        ano: { [Op.in]: anos },
        mes: { [Op.in]: meses },
        id_mural_descricao: id_mural_descricao,
      },
    });

    console.log("dados: ", dados);

    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar mural_dados:", error);
    res.status(500).json({ Msg: "Erro interno no servidor." });
  }
};
