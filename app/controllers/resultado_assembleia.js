const models = require("../../db/models");

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
