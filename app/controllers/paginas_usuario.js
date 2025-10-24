// app/controllers/paginas_usuario.js
const models = require("../../db/models");

module.exports = {
  // Lista todos os relacionamentos usuário x página (RAW SQL - seguro)
  async listarPaginasUsuario(req, res) {
    try {
      const sql = `
        SELECT 
          pu.id,
          pu.id_pagina,
          pu.id_usuario,
          pu.createdAt,
          pu.updatedAt,
          u.id AS usuario_id,
          u.nome AS usuario_nome,
          u.login AS usuario_login,
          p.id AS pagina_id,
          p.descricao AS pagina_descricao
        FROM paginas_usuario pu
        LEFT JOIN usuarios u ON pu.id_usuario = u.id
        LEFT JOIN paginas_portal p ON pu.id_pagina = p.id
        ORDER BY pu.id;
      `;
      const paginasUsuario = await models.sequelize.query(sql, {
        type: models.Sequelize.QueryTypes.SELECT,
      });

      return res.json(paginasUsuario);
    } catch (error) {
      console.error("Erro ao listar páginas de usuário:", error);
      return res
        .status(500)
        .json({ error: "Erro ao listar registros", details: String(error) });
    }
  },

  // Consulta uma relação específica (raw)
  async consultarPaginasUsuario(req, res) {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Id é obrigatório" });

      const sql = `
        SELECT 
          pu.id,
          pu.id_pagina,
          pu.id_usuario,
          pu.createdAt,
          pu.updatedAt,
          u.id AS usuario_id,
          u.nome AS usuario_nome,
          u.login AS usuario_login,
          p.id AS pagina_id,
          p.descricao AS pagina_descricao
        FROM paginas_usuario pu
        LEFT JOIN usuarios u ON pu.id_usuario = u.id
        LEFT JOIN paginas_portal p ON pu.id_pagina = p.id
        WHERE pu.id = :id
        LIMIT 1;
      `;
      const results = await models.sequelize.query(sql, {
        replacements: { id },
        type: models.Sequelize.QueryTypes.SELECT,
      });

      if (!results || results.length === 0)
        return res.status(404).json({ error: "Relação não encontrada" });

      return res.json(results[0]);
    } catch (error) {
      console.error("Erro ao consultar página de usuário:", error);
      return res
        .status(500)
        .json({ error: "Erro ao consultar registro", details: String(error) });
    }
  },

  // Cadastra nova relação (usa raw check para evitar problemas de associação)
  async cadastrarPaginasUsuario(req, res) {
    try {
      const { id_pagina, id_usuario } = req.body;

      if (!id_pagina || !id_usuario) {
        return res
          .status(400)
          .json({ error: "id_pagina e id_usuario são obrigatórios" });
      }

      // Verifica se usuário e página existem (usando modelos já existentes)
      const usuario = await models.usuarios.findByPk(id_usuario);
      const pagina = await models.paginas_portal.findByPk(id_pagina);

      if (!usuario || !pagina) {
        return res
          .status(400)
          .json({ error: "Usuário ou página não encontrados" });
      }

      // Verifica existência com RAW query (seguro enquanto associações não estiverem 100%)
      const existingSql = `
        SELECT id
        FROM paginas_usuario
        WHERE id_pagina = :id_pagina AND id_usuario = :id_usuario
        LIMIT 1;
      `;
      const existing = await models.sequelize.query(existingSql, {
        replacements: { id_pagina, id_usuario },
        type: models.Sequelize.QueryTypes.SELECT,
      });

      if (existing && existing.length > 0) {
        return res
          .status(409)
          .json({ error: "Relação já cadastrada para esse usuário" });
      }

      // Cria a relação
      const novaRelacao = await models.paginas_usuario.create({
        id_pagina,
        id_usuario,
      });

      return res.status(201).json({
        PaginaXUsuario: novaRelacao,
        Msg: "Relação cadastrada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao cadastrar página de usuário:", error);
      return res
        .status(500)
        .json({ error: "Erro ao cadastrar registro", details: String(error) });
    }
  },

  async cadastrarPaginasUsuarioBatch(req, res) {
    const t = await models.sequelize.transaction();
    try {
      const { id_usuario, paginas } = req.body;
      if (!id_usuario || !Array.isArray(paginas)) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "id_usuario e paginas[] obrigatórios" });
      }

      // valida usuario
      const usuario = await models.usuarios.findByPk(id_usuario, {
        transaction: t,
      });
      if (!usuario) {
        await t.rollback();
        return res.status(400).json({ error: "Usuario não encontrado" });
      }

      // valida páginas existentes em uma única query
      const paginasEncontradas = await models.paginas_portal.findAll({
        where: { id: paginas },
        attributes: ["id"],
        transaction: t,
      });
      const foundIds = paginasEncontradas.map((p) => Number(p.id));
      const missing = paginas.filter((id) => !foundIds.includes(Number(id)));
      if (missing.length > 0) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "Algumas páginas não existem", missing });
      }

      // prepara entradas e bulkCreate (MySQL: ignoreDuplicates evita erro se já existir)
      const now = new Date();
      const rows = paginas.map((id_pagina) => ({
        id_pagina,
        id_usuario,
        createdAt: now,
        updatedAt: now,
      }));

      await models.paginas_usuario.bulkCreate(rows, {
        ignoreDuplicates: true,
        transaction: t,
      });

      await t.commit();
      return res
        .status(201)
        .json({ Msg: "Relações cadastradas (batch) com sucesso" });
    } catch (err) {
      await t.rollback();
      console.error("Erro cadastrarPaginasUsuarioBatch:", err);
      return res
        .status(500)
        .json({
          error: "Erro ao cadastrar relações (batch)",
          details: String(err),
        });
    }
  },

  // Remove várias relações em batch. Body (DELETE): { id_usuario: number, paginas: number[] }
  async excluirPaginasUsuarioBatch(req, res) {
    const t = await models.sequelize.transaction();
    try {
      // axios sends body on DELETE only with { data: ... } on client; on server it's in req.body
      const { id_usuario, paginas } = req.body;
      if (!id_usuario || !Array.isArray(paginas)) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "id_usuario e paginas[] obrigatórios" });
      }

      const deleted = await models.paginas_usuario.destroy({
        where: { id_usuario, id_pagina: paginas },
        transaction: t,
      });

      await t.commit();
      return res.json({ Msg: "Relações removidas (batch)", deleted });
    } catch (err) {
      await t.rollback();
      console.error("Erro excluirPaginasUsuarioBatch:", err);
      return res
        .status(500)
        .json({
          error: "Erro ao excluir relações (batch)",
          details: String(err),
        });
    }
  },

  // Atualiza relação existente
  async alterarPaginasUsuario(req, res) {
    try {
      const { id, id_pagina, id_usuario } = req.body;
      if (!id) return res.status(400).json({ error: "Id é obrigatório" });

      const relacao = await models.paginas_usuario.findByPk(id);
      if (!relacao)
        return res.status(404).json({ error: "Relação não encontrada" });

      await relacao.update({ id_pagina, id_usuario, updatedAt: new Date() });

      return res.json({
        PaginaXUsuario: relacao,
        Msg: "Relação atualizada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao alterar página de usuário:", error);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar registro", details: String(error) });
    }
  },

  // Exclui uma relação
  async excluirPaginasUsuario(req, res) {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "Id é obrigatório" });

      const relacao = await models.paginas_usuario.findByPk(id);
      if (!relacao)
        return res.status(404).json({ error: "Relação não encontrada" });

      await relacao.destroy();

      return res.json({
        PaginaXUsuario: relacao,
        Msg: "Relação excluída com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir página de usuário:", error);
      return res
        .status(500)
        .json({ error: "Erro ao excluir registro", details: String(error) });
    }
  },
};
