// app/controllers/gravame.js
const models = require("../../db/models");
const { enviarGravameSNG } = require("../utils/b3Integration");

module.exports.listarGravames = async function (req, res) {
  // Exemplo buscando registros salvos no banco local
  // var gravames = await models.gravame.findAll();
  res.send({ Msg: "Rota de listagem preparada" });
};

module.exports.cadastrarGravame = async function (req, res) {
  try {
    const dadosFormulario = req.body;

    // 1. Mapear os dados do formulário para o payload exigido pela B3
    const payloadB3 = {
      // Exemplo estrutural
      veiculo: {
        chassi: dadosFormulario.chassi,
        renavam: dadosFormulario.renavam,
        placa: dadosFormulario.placa,
        uf: dadosFormulario.ufVeiculo,
      },
      // ... demais dados de contrato e consorciado
    };

    // 2. Disparar para a B3 usando nossa função utilitária com mTLS + Token
    const retornoB3 = await enviarGravameSNG(payloadB3);

    // 3. Salvar no banco de dados local com Sequelize (exemplo genérico)
    /*
    var gravameLocal = await models.gravame.create({
      chassi: dadosFormulario.chassi,
      status_b3: retornoB3.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    */

    res.json({
      Gravame: dadosFormulario.chassi,
      Status: "Transmitido",
      DetalhesB3: retornoB3,
    });
  } catch (error) {
    console.error("Erro no fluxo de gravame:", error);
    res.status(500).json({ Msg: "Erro ao registrar gravame na B3." });
  }
};
