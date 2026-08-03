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
        '0' AS indRemarcacao, -- SNG: 0 = Normal
        ISNULL(co.UF_PLACA, '') AS siglaUfPlaca,
        ISNULL(co.PLACA, '') AS numPlaca,
        ISNULL(co.CODIGO_RENAVAM, '') AS numRenavam,
        
        -- Separação do Ano/Modelo (Ex: 2023/2024 -> Fab: 2023, Mod: 2024)
        LEFT(ISNULL(co.ANO_MODELO, YEAR(GETDATE())), 4) AS numAnoFabricacao,
        RIGHT(ISNULL(co.ANO_MODELO, YEAR(GETDATE())), 4) AS numAnoModelo,
        
        CASE WHEN co.procedencia = 'N' THEN '1' ELSE '0' END AS indVeiculoNovo, 
        ISNULL(cidl.ESTADO, cid.ESTADO) AS siglaUfLicenciamento, 

        -- ==========================================
        -- 2. DADOS DO CONSORCIADO (B3)
        -- ==========================================
        c.NOME AS nomeFinanciado,
        -- SNG exige: 1 para CPF, 2 para CNPJ
        CASE WHEN LEN(REPLACE(REPLACE(REPLACE(c.CGC_CPF_CLIENTE,'.',''),'-',''),'/','')) > 11 THEN '2' ELSE '1' END AS indTipoDocumentoFinanciado,
        REPLACE(REPLACE(REPLACE(c.CGC_CPF_CLIENTE,'.',''),'-',''),'/','') AS numDocumentoFinanciado,
        
        -- ==========================================
        -- TRATAMENTO INTELIGENTE DE ENDEREÇO
        -- ==========================================
        -- LOGRADOURO (Máx 30 caracteres para a B3)
        SUBSTRING(
            CASE 
                -- 1. Se tem vírgula, corta na vírgula
                WHEN CHARINDEX(',', c.ENDERECO) > 0 
                THEN RTRIM(LEFT(c.ENDERECO, CHARINDEX(',', c.ENDERECO) - 1)) 
                
                -- 2. Se não tem vírgula, mas a última palavra contém um número (Ex: "180" ou "180A")
                WHEN CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) > 0 
                     AND PATINDEX('%[0-9]%', RIGHT(RTRIM(c.ENDERECO), CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) - 1)) > 0
                THEN RTRIM(LEFT(c.ENDERECO, LEN(RTRIM(c.ENDERECO)) - CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO)))))
                
                -- 3. Caso contrário, manda tudo
                ELSE RTRIM(c.ENDERECO)
            END, 
        1, 30) AS nomeEnderecoFinanciado,
        
        -- NÚMERO (Máx 5 caracteres para a B3)
        SUBSTRING(
            CASE 
                -- 1. Se tem vírgula, pega o que vem depois
                WHEN CHARINDEX(',', c.ENDERECO) > 0 
                THEN LTRIM(SUBSTRING(c.ENDERECO, CHARINDEX(',', c.ENDERECO) + 1, LEN(c.ENDERECO))) 
                
                -- 2. Se não tem vírgula, mas a última palavra tem número, isola a última palavra
                WHEN CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) > 0 
                     AND PATINDEX('%[0-9]%', RIGHT(RTRIM(c.ENDERECO), CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) - 1)) > 0
                THEN RIGHT(RTRIM(c.ENDERECO), CHARINDEX(' ', REVERSE(RTRIM(c.ENDERECO))) - 1)
                
                -- 3. Caso contrário, envia o padrão S/N
                ELSE 'S/N' 
            END, 
        1, 5) AS numEnderecoFinanciado,
        
        ISNULL(c.COMPLEMENTO, '') AS descComplementoEnderecoFinanciado,
        c.BAIRRO AS nomeBairroEnderecoFinanciado,
        cid.ESTADO AS siglaUfEnderecoFinanciado,
        
        -- A B3 exige o código IBGE (TOM) do município
        ISNULL(cid.CODIGO_IBGE, '0000') AS codMunicipioEnderecoFinanciado,
        REPLACE(c.CEP, '-', '') AS numCepEnderecoFinanciado,
        ISNULL(c.DDD_RESIDENCIAL, '00') AS numDddTelefoneFinanciado,
        ISNULL(c.CELULAR, '000000000') AS numTelefoneFinanciado,

        -- ==========================================
        -- 3. DADOS DO CONTRATO E FINANCEIRO (B3)
        -- ==========================================
        (convert(VARCHAR(10),ct.CODIGO_GRUPO) + convert(VARCHAR(10),ct.CODIGO_COTA)) AS numContrato,
        
        -- Data do Contrato fixada para o dia atual (geração)
        CONVERT(VARCHAR(10), GETDATE(), 23) AS dtContrato,
        
        -- Duração e Valores
        ISNULL(pa.qtdMeses, 0) AS qteMesesVigenciaContrato,
        cast(((((100 - ct.PERCENTUAL_IDEAL_DEVIDO) + (ct.PERCENTUAL_TAXA_ADMINISTRACAO - ct.TAXA_ADMINISTRACAO_PAGA)) * ValorBem.PRECO_TABELA) / 100) AS DECIMAL(10,2))
        AS valPrincipal,
        
        -- Data de Liberação (Pagamento da Operação) fixada para o dia atual (geração)
        CONVERT(VARCHAR(10), GETDATE(), 23) AS dtLiberacao,
        
        ISNULL(cidl.ESTADO, cid.ESTADO) AS siglaUfLiberacao,
        SUBSTRING(ISNULL(cidl.NOME, cid.NOME), 1, 25) AS nomeCidadeLiberacao, -- Limitado a 25 caracteres no SNG
        
        -- Vencimentos (Formato AAAA-MM-DD)
        CONVERT(VARCHAR(10), vpp.dataVencimento, 23) AS dtVencimentoPrimeiraParcela,
        CONVERT(VARCHAR(10), DATEADD(MONTH, ISNULL(pa.qtdMeses, 1) - 1, vpp.dataVencimento), 23) AS dtVencimentoUltimaParcela,
        
        -- Financeiro
        CAST(ISNULL(vpp.proximaParcela, 0) AS DECIMAL(10,2)) AS valParcela,
        'VALOR BEM' AS nomeIndiceCorrecaoUtilizado,
        
        -- Valores default para preencher o state do React
        '0.00' AS valTaxaContrato,
        '0.00' AS valIof,
        
        -- Penalidades e Multas Padrão Groscon (0 = Não, 1 = Sim)
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
    
    -- Traz os dados do Bem Alienado
    LEFT JOIN CONTROLES_OPCOES co ON co.codigo_grupo = ct.codigo_grupo AND co.codigo_cota = ct.codigo_cota AND co.VERSAO = ct.VERSAO
    LEFT JOIN CIDADES cidl ON co.CODIGO_CIDADE_LICENCIAMENTO = cidl.CODIGO_CIDADE

    -- Lógica de Parcelas
    OUTER APPLY (
        SELECT COUNT(*) AS qtdMeses 
        FROM COBRANCAS_ESPECIAIS ce
        WHERE ce.CODIGO_GRUPO = ct.CODIGO_GRUPO AND ce.CODIGO_COTA = ct.CODIGO_COTA AND ce.VERSAO = ct.VERSAO AND ce.STATUS_PARCELA = 'N'
    ) pa

    -- Lógica de Vencimentos
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

module.exports = function () {
  return GravamesERP;
};
