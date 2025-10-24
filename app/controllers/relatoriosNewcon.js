// app/controllers/relatoriosNewcon.js
const db = require("../../db/models");

module.exports = {
  // GET /relatoriosNewcon
  async listarRelatorios(req, res) {
    try {
      const relatorios = await db.relatoriosNewcon.findAll({
        order: [["id", "ASC"]],
      });
      return res.json(relatorios);
    } catch (err) {
      console.error("Erro listarRelatorios:", err);
      return res.status(500).json({ message: "Erro ao listar relatórios" });
    }
  },

  // GET /relatoriosUsuario (opcional: ?id=123) ou se token usado, retorna do usuário logado
  async getRelatoriosUsuario(req, res) {
    try {
      // prioriza query id, senão usa req.user.id (verifyJWT deve preencher req.user)
      const idUsuario = req.query.id
        ? parseInt(req.query.id, 10)
        : req.user && req.user.id;
      if (!idUsuario)
        return res.status(400).json({ message: "ID do usuário é obrigatório" });

      const user = await db.usuarios.findByPk(idUsuario, {
        include: [{ model: db.relatoriosNewcon, through: { attributes: [] } }],
      });

      if (!user)
        return res.status(404).json({ message: "Usuário não encontrado" });

      // normaliza retorno: array de objetos { id, descricao }
      const rels = (user.relatoriosNewcons || user.relatoriosNewcon || []).map(
        (r) => ({ id: r.id, descricao: r.descricao })
      );
      return res.json({ relatorios: rels });
    } catch (err) {
      console.error("Erro getRelatoriosUsuario:", err);
      return res
        .status(500)
        .json({ message: "Erro ao buscar relatórios do usuário" });
    }
  },

  // POST /setRelatoriosUsuario
  // body: { id_usuario, relatorios: [ids], relatorios_descricao: [descricoes] }
  async setRelatoriosUsuario(req, res) {
    try {
      const { id_usuario, relatorios, relatorios_descricao } = req.body;
      if (!id_usuario)
        return res.status(400).json({ message: "id_usuario é obrigatório" });

      const user = await db.usuarios.findByPk(id_usuario);
      if (!user)
        return res.status(404).json({ message: "Usuário não encontrado" });

      // Atualiza por IDs (substitui entradas existentes)
      if (Array.isArray(relatorios) && relatorios.length) {
        if (typeof user.setRelatoriosNewcons === "function") {
          await user.setRelatoriosNewcons(relatorios);
        } else {
          // fallback: manipula pivot manualmente
          await db.relatoriosNewcon_usuario.destroy({ where: { id_usuario } });
          const rows = relatorios.map((rel_id) => ({
            relatorio_id: rel_id,
            id_usuario,
          }));
          if (rows.length) await db.relatoriosNewcon_usuario.bulkCreate(rows);
        }
        return res.json({ message: "Permissões atualizadas (por id)" });
      }

      // Atualiza por descricoes (slugs)
      if (Array.isArray(relatorios_descricao) && relatorios_descricao.length) {
        const rows = await db.relatoriosNewcon.findAll({
          where: { descricao: relatorios_descricao },
        });
        const ids = rows.map((r) => r.id);
        if (typeof user.setRelatoriosNewcons === "function") {
          await user.setRelatoriosNewcons(ids);
        } else {
          await db.relatoriosNewcon_usuario.destroy({ where: { id_usuario } });
          const insert = ids.map((rel_id) => ({
            relatorio_id: rel_id,
            id_usuario,
          }));
          if (insert.length)
            await db.relatoriosNewcon_usuario.bulkCreate(insert);
        }
        return res.json({ message: "Permissões atualizadas (por descricao)" });
      }

      return res.status(400).json({
        message:
          "Envie 'relatorios' (ids) ou 'relatorios_descricao' (descrições)",
      });
    } catch (err) {
      console.error("Erro setRelatoriosUsuario:", err);
      return res
        .status(500)
        .json({ message: "Erro ao atualizar relatórios do usuário", err });
    }
  },

  // opcional: criar um endpoint para adicionar um relatorio (admin)
  async criarRelatorio(req, res) {
    try {
      const { descricao } = req.body;
      if (!descricao)
        return res.status(400).json({ message: "descricao é obrigatória" });

      const [r, created] = await db.relatoriosNewcon.findOrCreate({
        where: { descricao },
        defaults: { descricao },
      });
      return res.json({ relatorio: r, created });
    } catch (err) {
      console.error("Erro criarRelatorio:", err);
      return res.status(500).json({ message: "Erro ao criar relatório" });
    }
  },
};
