const models = require("../../db/models");

module.exports.listarGestores = async (req, res) => {
  try {
    const gestores = await models.gestores.findAll({
      order: [["nome", "ASC"]],
    });
    res.json(gestores);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar gestores" });
  }
};

module.exports.salvarGestor = async (req, res) => {
  try {
    const { id, nome, email, ddds } = req.body;
    if (id) {
      const gestor = await models.gestores.findByPk(id);
      await gestor.update({ nome, email, ddds });
      return res.json({ Gestor: gestor, Msg: "Atualizado!" });
    }
    const novo = await models.gestores.create({ nome, email, ddds });
    res.json({ Gestor: novo, Msg: "Criado!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar gestor" });
  }
};

module.exports.excluirGestor = async (req, res) => {
  try {
    await models.gestores.destroy({ where: { id: req.body.id } });
    res.json({ Msg: "Excluído!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir gestor" });
  }
};
