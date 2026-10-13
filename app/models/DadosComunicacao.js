function DadosComunicacao(connection) {
  this._connection = connection;
}

DadosComunicacao.prototype.listaDadosQuitados = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;

  let result = await this._connection(`
    select ct.CODIGO_GRUPO as 'Grupo',
       ct.CODIGO_COTA as 'Cota',
	   ct.VERSAO as 'Versão',
       cl.NOME as 'nome',
	   cl.E_MAIL as 'email',
	   format (ct.DATA_SITUACAO,'dd/MM/yyyy', 'en-US') as 'Data da quitação',
       ct.id_cota as id	   
    from cotas ct
    inner join clientes cl 
    on cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
    and cl.tipo = ct.tipo
    left join (select CODIGO_GRUPO, 
                        CODIGO_COTA, 
                        VERSAO,
                        count(*) as QTD_SIT
                    from COTAS_SITUACOES cs 
                where cs.CODIGO_SITUACAO = 'Q01'
                group by cs.CODIGO_GRUPO
                        ,cs.CODIGO_COTA
                        ,cs.VERSAO) a 
        on a.CODIGO_GRUPO = ct.CODIGO_GRUPO
    and a.CODIGO_COTA = ct.CODIGO_COTA
    and a.VERSAO = ct.VERSAO
    LEFT JOIN TELEFONES_COTAS TC ON CL.CGC_CPF_CLIENTE = TC.CGC_CPF_CLIENTE
    left join REPRESENTANTES rep on ct.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
    left join CIDADES cid on cl.CODIGO_CIDADE = cid.CODIGO_CIDADE
    outer apply (select top 1 rb.PRECO_TABELA from REAJUSTES_BENS rb where rb.CODIGO_BEM = ct.CODIGO_BEM order by DATA_REAJUSTE desc) rb  
    where ct.CODIGO_SITUACAO = 'Q00'
    and ct.DATA_SITUACAO between '${data_inicial}' and '${data_final}'
    and a.QTD_SIT is null
    order by [Data da quitação] desc`);
  return result;
};

DadosComunicacao.prototype.listaDadosPeriodoSituacao = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let situacoes_cruas = req.query.situacoes || "";

  // Transforma a string "N00,NC1,NC2" em "'N00','NC1','NC2'" para o IN do SQL
  let situacoesFormatadas = situacoes_cruas
    .split(",")
    .filter((sit) => sit.trim() !== "")
    .map((sit) => `'${sit.trim()}'`)
    .join(",");

  // Se vier vazio por algum motivo, previne erro de SQL injetando uma string vazia
  if (!situacoesFormatadas) {
    situacoesFormatadas = "''";
  }

  let result = await this._connection(`
    select 
      ct.CGC_CPF_CLIENTE as documento,
      c.NOME as nome,
      c.E_MAIL as email,
      ct.id_cota as id
    from cotas ct
    left join clientes c
    on ct.CGC_CPF_CLIENTE = c.CGC_CPF_CLIENTE and ct.TIPO = c.tipo
    where ct.CODIGO_SITUACAO in (${situacoesFormatadas})
      and ct.DATA_VENDA between '${data_inicial}' and '${data_final}'
  `);

  return result;
};

DadosComunicacao.prototype.listaDadosFcPagoSituacao = async function (req) {
  let fcPago = parseFloat(req.query.fcPago || 0); // 🌟 Converte garantido para número no Node
  let situacoes_cruas = req.query.situacoes || "";

  let situacoesFormatadas = situacoes_cruas
    .split(",")
    .filter((sit) => sit.trim() !== "")
    .map((sit) => `'${sit.trim()}'`)
    .join(",");

  if (!situacoesFormatadas) {
    situacoesFormatadas = "''";
  }

  // 🌟 OTIMIZADO: Usando GROUP BY para garantir apenas 1 CPF por linha!
  let sql = `
    SELECT 
      c.CGC_CPF_CLIENTE as documento,
      c.NOME as nome,
      LTRIM(RTRIM(c.E_MAIL)) as email,
      MAX(ct.PERCENTUAL_IDEAL_DEVIDO) as '% FC Pago' -- 🌟 Pega o maior % das cotas deste cliente
    FROM CLIENTES c
    INNER JOIN cotas ct 
      ON c.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE AND c.TIPO = ct.TIPO
    WHERE ISNULL(ct.PERCENTUAL_IDEAL_DEVIDO, 0) > ${fcPago}
      AND ct.CODIGO_SITUACAO IN (${situacoesFormatadas})
      AND c.E_MAIL IS NOT NULL
      AND LTRIM(RTRIM(c.E_MAIL)) <> ''
      AND c.E_MAIL LIKE '%_@__%.__%'
    GROUP BY 
      c.CGC_CPF_CLIENTE,
      c.NOME,
      LTRIM(RTRIM(c.E_MAIL))
  `;

  let result = await this._connection(sql);
  return result;
};

module.exports = function () {
  return DadosComunicacao;
};
