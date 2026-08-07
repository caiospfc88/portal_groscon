// app/models/GravamesERP.js

function GravamesERP(connection) {
  this._connection = connection;
}

GravamesERP.prototype.buscarDadosCotaParaB3 = async function (
  grupo,
  cota,
  versao = 0,
) {
  let result = await this._connection(`
    SELECT TOP 1
        -- ==========================================
        -- 1. DADOS DO VEÍCULO (B3)
        -- ==========================================
        ISNULL(co.CHASSI, '') AS numChassi,
        '0' AS indRemarcacao,
        ISNULL(co.UF_PLACA, '') AS siglaUfPlaca,
        ISNULL(co.PLACA, '') AS numPlaca,
        ISNULL(co.CODIGO_RENAVAM, '') AS numRenavam,
        LEFT(ISNULL(co.ANO_MODELO, YEAR(GETDATE())), 4) AS numAnoFabricacao,
        RIGHT(ISNULL(co.ANO_MODELO, YEAR(GETDATE())), 4) AS numAnoModelo,
        CASE WHEN co.procedencia = 'N' THEN '1' ELSE '0' END AS indVeiculoNovo, 
        ISNULL(cidl.ESTADO, cid.ESTADO) AS siglaUfLicenciamento, 

        -- ==========================================
        -- 2. DADOS DO FINANCIADO (B3)
        -- ==========================================
        LEFT(c.NOME, 40) AS nomeFinanciado, 
        CASE WHEN LEN(REPLACE(REPLACE(REPLACE(c.CGC_CPF_CLIENTE,'.',''),'-',''),'/','')) > 11 THEN '2' ELSE '1' END AS indTipoDocumentoFinanciado,
        REPLACE(REPLACE(REPLACE(c.CGC_CPF_CLIENTE,'.',''),'-',''),'/','') AS numDocumentoFinanciado,
        
        -- TRATAMENTO DE ENDEREÇO
        SUBSTRING(
            CASE 
                WHEN CHARINDEX(',', c.ENDERECO) > 0 
                THEN RTRIM(LEFT(c.ENDERECO, CHARINDEX(',', c.ENDERECO) - 1)) 
                WHEN CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) > 0 
                     AND PATINDEX('%[0-9]%', RIGHT(RTRIM(c.ENDERECO), CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) - 1)) > 0
                THEN RTRIM(LEFT(c.ENDERECO, LEN(RTRIM(c.ENDERECO)) - CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO)))))
                ELSE RTRIM(c.ENDERECO)
            END, 
        1, 30) AS nomeEnderecoFinanciado,
        
        SUBSTRING(
            CASE 
                WHEN CHARINDEX(',', c.ENDERECO) > 0 
                THEN LTRIM(SUBSTRING(c.ENDERECO, CHARINDEX(',', c.ENDERECO) + 1, LEN(c.ENDERECO))) 
                WHEN CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) > 0 
                     AND PATINDEX('%[0-9]%', RIGHT(RTRIM(c.ENDERECO), CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) - 1)) > 0
                THEN RIGHT(RTRIM(c.ENDERECO), CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) - 1)
                ELSE 'S/N' 
            END, 
        1, 5) AS numEnderecoFinanciado,
        
        ISNULL(c.COMPLEMENTO, '') AS descComplementoEnderecoFinanciado,
        LEFT(c.BAIRRO, 20) AS nomeBairroEnderecoFinanciado,
        cid.ESTADO AS siglaUfEnderecoFinanciado,
        REPLACE(c.CEP, '-', '') AS numCepEnderecoFinanciado,
        
        -- ==========================================
        -- O PULO DO GATO: CODIGO TOM DIRETO DA TABELA CIDADES
        -- ==========================================
        ISNULL(cid.CODIGO_MUNICIPIO_DETRAN, '') AS codMunicipioEnderecoFinanciado,
        ISNULL(cid.NOME, '') AS nomeCidadeAuxiliar, -- Para mostrar no aviso do front-end
        
        -- TRATAMENTO ESTRITO DE TELEFONE (Apenas números e limites de tamanho)
        LEFT(REPLACE(REPLACE(REPLACE(ISNULL(c.DDD_RESIDENCIAL, '00'), '-', ''), ' ', ''), '(', ''), 3) AS numDddTelefoneFinanciado,
        LEFT(REPLACE(REPLACE(REPLACE(ISNULL(c.CELULAR, '000000000'), '-', ''), ' ', ''), ')', ''), 9) AS numTelefoneFinanciado,

        -- ==========================================
        -- 3. DADOS DO CONTRATO E FINANCEIRO (B3)
        -- ==========================================
        3 AS codTipoApontamento, 
        
        (convert(VARCHAR(10),ct.CODIGO_GRUPO) + convert(VARCHAR(10),ct.CODIGO_COTA)) AS numContrato,
        CONVERT(VARCHAR(10), GETDATE(), 23) AS dtContrato,
        ISNULL(pa.qtdMeses, 0) AS qteMesesVigenciaContrato,
        cast(((((100 - ct.PERCENTUAL_IDEAL_DEVIDO) + (ct.PERCENTUAL_TAXA_ADMINISTRACAO - ct.TAXA_ADMINISTRACAO_PAGA)) * ValorBem.PRECO_TABELA) / 100) AS DECIMAL(10,2)) AS valPrincipal,
        CONVERT(VARCHAR(10), GETDATE(), 23) AS dtLiberacao,
        ISNULL(cidl.ESTADO, cid.ESTADO) AS siglaUfLiberacao,
        SUBSTRING(ISNULL(cidl.NOME, cid.NOME), 1, 25) AS nomeCidadeLiberacao,
        CONVERT(VARCHAR(10), vpp.dataVencimento, 23) AS dtVencimentoPrimeiraParcela,
        CONVERT(VARCHAR(10), DATEADD(MONTH, ISNULL(pa.qtdMeses, 1) - 1, vpp.dataVencimento), 23) AS dtVencimentoUltimaParcela,
        CAST(ISNULL(vpp.proximaParcela, 0) AS DECIMAL(10,2)) AS valParcela,
        'VALOR BEM' AS nomeIndiceCorrecaoUtilizado,
        
        '0.00' AS valTaxaContrato,
        '0.00' AS valIof,
        '1' AS indMulta,
        '2.00' AS valPercentualMulta,
        '1.00' AS valPercentualTaxaJurosMes,
        '12.00' AS valPercentualTaxaJurosAno,
        '1' AS indJurosMora,
        '1.00' AS valPercentualJurosMora,
        '0' AS indPenalidade,
        '' AS descPenalidade,
        '0' AS indComissao,
        '0.00' AS valComissao,

        -- ==========================================
        -- 4. DADOS DO VENDEDOR/RECEBEDOR (B3)
        -- ==========================================
        REPLACE(REPLACE(REPLACE(ISNULL(co.CGC_CPF_FAVORECIDO, ''),'.',''),'-',''),'/','') AS numDocumentoVendedor,
        CASE WHEN LEN(REPLACE(REPLACE(REPLACE(ISNULL(co.CGC_CPF_FAVORECIDO, ''),'.',''),'-',''),'/','')) > 11 THEN '2' ELSE '1' END AS indTipoDocumentoRecebedor,
        REPLACE(REPLACE(REPLACE(ISNULL(co.CGC_CPF_FAVORECIDO, ''),'.',''),'-',''),'/','') AS numDocumentoRecebedor,
        
        -- ==========================================
        -- 5. IDENTIFICAÇÃO DO CONSÓRCIO
        -- ==========================================
        ct.CODIGO_GRUPO AS codGrupoConsorcio,
        ct.CODIGO_COTA AS numCotaConsorcio,
        ISNULL(co.OBSERVACOES, 'GRAVAME INSERIDO VIA API') AS txtObservacao

    FROM cotas ct
    LEFT JOIN clientes c ON ct.cgc_cpf_cliente = c.CGC_CPF_CLIENTE AND ct.TIPO = c.TIPO
    LEFT JOIN CIDADES cid ON c.CODIGO_CIDADE = cid.CODIGO_CIDADE
    LEFT JOIN CONTROLES_OPCOES co ON co.codigo_grupo = ct.codigo_grupo AND co.codigo_cota = ct.codigo_cota AND co.VERSAO = ct.VERSAO
    LEFT JOIN CIDADES cidl ON co.CODIGO_CIDADE_LICENCIAMENTO = cidl.CODIGO_CIDADE

    OUTER APPLY (
        SELECT COUNT(*) AS qtdMeses 
        FROM COBRANCAS_ESPECIAIS ce
        WHERE ce.CODIGO_GRUPO = ct.CODIGO_GRUPO AND ce.CODIGO_COTA = ct.CODIGO_COTA AND ce.VERSAO = ct.VERSAO AND ce.STATUS_PARCELA = 'N'
    ) pa

    OUTER APPLY (
        SELECT TOP 1 (cob.VALOR_FUNDO_COMUM + cob.VALOR_TAXA_ADMINISTRACAO) AS proximaParcela, cob.DATA_VENCIMENTO AS dataVencimento
        FROM COBRANCAS cob 
        WHERE cob.CODIGO_GRUPO = ct.CODIGO_GRUPO AND cob.CODIGO_COTA = ct.CODIGO_COTA AND cob.VERSAO = ct.VERSAO AND cob.DATA_VENCIMENTO >= CAST(GETDATE() AS DATE)
        ORDER BY cob.DATA_VENCIMENTO
    ) vpp

    OUTER APPLY (
      SELECT TOP 1 preco_tabela 
      FROM REAJUSTES_BENS rb
      WHERE ct.codigo_bem = rb.CODIGO_BEM 
      ORDER BY DATA_REAJUSTE DESC
  ) as ValorBem

    WHERE ct.codigo_grupo = ${grupo} AND ct.CODIGO_COTA = ${cota} AND ct.VERSAO = ${versao};
  `);

  return result && result.length > 0 ? result[0] : null;
};

GravamesERP.prototype.buscarVeiculosCota = async function (
  grupo,
  cota,
  versao = 0,
) {
  let result = await this._connection(`
    select co.MODELO as veiculo,
        co.COR as cor,
        co.ANO_MODELO as ano,
        co.VALOR_BEM as valor,
        co.CHASSI as chassi,
        co.PLACA as placa,
        format(co.DATA_LIBERACAO,'dd/MM/yyyy','en-US') as liberacao
    from CONTROLES_OPCOES co
    WHERE co.codigo_grupo = ${grupo} AND co.CODIGO_COTA = ${cota} AND co.VERSAO = ${versao} and co.VALOR_BEM > 10000;
  `);

  return result && result.length > 0 ? result : [];
};

module.exports = function () {
  return GravamesERP;
};
