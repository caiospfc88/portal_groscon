const models = require("../../db/models");
const { Op } = require("sequelize");

// Lista os contemplados publicados (pode filtrar por data_assembleia ou trazer todos)
module.exports.listarContempladosPublicados = async function (req, res) {
  try {
    const whereClause = {};
    if (req.query.data_assembleia) {
      whereClause.data_assembleia = String(req.query.data_assembleia);
    }

    const publicados = await models.contemplados_publicados.findAll({
      where: whereClause,
      order: [
        ["data_assembleia", "DESC"],
        ["grupo", "ASC"],
        ["cota", "ASC"],
      ],
    });

    res.status(200).json(publicados);
  } catch (error) {
    console.error("Erro ao listar contemplados publicados:", error);
    res.status(500).json({ erro: "Erro ao buscar contemplados publicados." });
  }
};

module.exports.listarContempladosAtendimento = async function (req, res) {
  try {
    const dataParam =
      req.body?.data_assembleia || req.query?.data_assembleia || null;
    const gruposRaw = req.body?.grupos ?? req.query?.grupos ?? null;

    // 1. Converte o filtro de grupos (aceita array [55, 56] ou string "55,56")
    let listaGrupos = [];
    if (Array.isArray(gruposRaw)) {
      listaGrupos = gruposRaw
        .map((g) => Number(String(g).replace(/\D/g, "")))
        .filter((n) => !isNaN(n) && n > 0);
    } else if (typeof gruposRaw === "string" && gruposRaw.trim() !== "") {
      listaGrupos = gruposRaw
        .split(",")
        .map((g) => Number(g.trim().replace(/\D/g, "")))
        .filter((n) => !isNaN(n) && n > 0);
    }

    const whereClause = {};

    if (listaGrupos.length > 0) {
      whereClause.grupo = { [Op.in]: listaGrupos };
    }

    // 2. Filtro de data específica ou busca automática da assembleia mais recente
    if (dataParam && String(dataParam).trim() !== "") {
      const dataLimpa = String(dataParam).trim();
      if (dataLimpa.includes("/")) {
        // Caso envie no formato DD/MM/YYYY (ex: "26/10/2026")
        whereClause.assembleia_formatada = dataLimpa;
      } else {
        // Caso envie no formato YYYY-MM-DD (ex: "2026-10-26")
        whereClause.data_assembleia = dataLimpa;
      }
    } else {
      // Se não informou data, busca a data_assembleia mais recente publicada (respeitando os grupos se informados)
      const maisRecente = await models.contemplados_publicados.findOne({
        where: whereClause,
        attributes: ["data_assembleia"],
        order: [["data_assembleia", "DESC"]],
      });

      if (!maisRecente) {
        return res.status(200).json([]);
      }

      whereClause.data_assembleia = maisRecente.data_assembleia;
    }

    // 3. Busca retornando apenas os campos necessários para a visualização
    const publicados = await models.contemplados_publicados.findAll({
      attributes: [
        "data_assembleia",
        "assembleia_formatada",
        "grupo",
        "cota",
        "versao",
        "contemplacao",
        "percentual_lance",
      ],
      where: whereClause,
      order: [
        ["data_assembleia", "DESC"],
        ["grupo", "ASC"],
        ["cota", "ASC"],
      ],
    });

    return res.status(200).json(publicados);
  } catch (error) {
    console.error("Erro ao listar contemplados para atendimento:", error);
    return res
      .status(500)
      .json({ erro: "Erro ao buscar resultados da assembleia." });
  }
};

// Publica uma cota contemplada
module.exports.publicarContemplado = async function (req, res) {
  try {
    const {
      data_assembleia,
      assembleia_formatada,
      grupo,
      cota,
      versao,
      nome,
      contemplacao,
      percentual_lance,
      valor_credito,
      vendedor,
      data_adesao,
    } = req.body;

    const [registro, created] =
      await models.contemplados_publicados.findOrCreate({
        where: {
          data_assembleia: String(data_assembleia),
          grupo: Number(grupo),
          cota: Number(cota),
          versao: Number(versao ?? 0),
        },
        defaults: {
          assembleia_formatada,
          nome,
          contemplacao,
          percentual_lance,
          valor_credito,
          vendedor,
          data_adesao,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

    // Se a cota já estava publicada (ex: outra modalidade), atualiza para a nova modalidade selecionada
    if (!created) {
      await registro.update({
        assembleia_formatada,
        nome,
        contemplacao,
        percentual_lance,
        valor_credito,
        vendedor,
        data_adesao,
        updatedAt: new Date(),
      });
    }

    res.status(200).json({
      Contemplado: registro,
      Substituido: !created,
      Msg: created
        ? "Publicado com sucesso!"
        : "Modalidade de contemplação substituída com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao publicar contemplado:", error);
    res.status(500).json({ erro: "Erro ao publicar contemplado." });
  }
};

// Despublica (remove da tabela de publicados)
module.exports.despublicarContemplado = async function (req, res) {
  try {
    const { data_assembleia, grupo, cota, versao } = req.body;

    const deletados = await models.contemplados_publicados.destroy({
      where: {
        data_assembleia: String(data_assembleia),
        grupo: Number(grupo),
        cota: Number(cota),
        versao: Number(versao ?? 0),
      },
    });

    if (deletados > 0) {
      res.status(200).json({ Msg: "Despublicado com sucesso!" });
    } else {
      res.status(404).json({ Msg: "Registro não encontrado." });
    }
  } catch (error) {
    console.error("Erro ao despublicar contemplado:", error);
    res.status(500).json({ erro: "Erro ao despublicar contemplado." });
  }
};
