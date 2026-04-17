function FormulariosGeracaoDocs(connection) {
  this._connection = connection;
}

FormulariosGeracaoDocs.prototype.formularioContratoVendaImovel =
  async function (req) {
    let grupo = req.query.grupo;
    let cota = req.query.cota;
    let versao = req.query.versao;

    let result = await this._connection(
      `
      WITH DadosCliente AS (
            SELECT 
                -- ==========================================
                -- 1. DADOS DO COMPRADOR (TITULAR)
                -- ==========================================
                c.NOME AS nome,
                c.CGC_CPF_CLIENTE AS cpf,
                c.E_MAIL AS email,
                c.SEXO AS sexo,
                concat(c.ENDERECO, ' - ', c.BAIRRO, ' - ', cid.NOME, '-', cid.ESTADO) AS enderecoCompleto,
                c.ESTADO_CIVIL AS codEstadoCivil,
                
                CASE c.ESTADO_CIVIL 
                    WHEN 'C' THEN 'casado(a)' WHEN 'S' THEN 'solteiro(a)' WHEN 'V' THEN 'viúvo(a)'
                    WHEN 'D' THEN 'divorciado(a)' WHEN 'U' THEN 'em união estável' ELSE 'estado civil não informado' 
                END AS estadoCivil,
                
                CASE WHEN tdi.DESCRICAO LIKE '%Carteira de Identidade%' THEN 'RG' ELSE ISNULL(tdi.DESCRICAO, 'Doc') END AS tipoDoc,
                c.DOCUMENTO AS documento,
                ISNULL(pro.DESCRICAO, 'profissão não informada') AS profissao,
                ISNULL(c.NACIONALIDADE, 'brasileiro(a)') AS nacionalidade,
                c.NOME_PAI AS pai,
                c.NOME_MAE AS mae,
                
                -- Cônjuge do Comprador
                c.NOME_CONJUGE AS conjugue,
                ISNULL(c.SEXO_CONJUGE, CASE WHEN c.SEXO = 'M' THEN 'F' ELSE 'M' END) AS sexoConjuge,
                CASE WHEN tdiConj.DESCRICAO LIKE '%Carteira de Identidade%' THEN 'RG' ELSE ISNULL(tdiConj.DESCRICAO, 'Doc') END AS tipoDocConjuge,
                c.DOCUMENTO_CONJUGE AS documentoConjuge,
                c.CPF_CONJUGE AS cpfConjuge,
                ISNULL(c.NACIONALIDADE_CONJUGE, 'brasileiro(a)') AS nacionalidadeConjuge,
                ISNULL(proConj.DESCRICAO, 'profissão não informada') AS profissaoConjuge,
                c.Endereco_Conjuge AS enderecoConjugue,

                -- ==========================================
                -- 2. DADOS DO FIADOR (DEVEDOR SOLIDÁRIO)
                -- ==========================================
                cFia.NOME AS nomeFia,
                cFia.CGC_CPF_CLIENTE AS cpfFia,
                cFia.E_MAIL AS emailFia,
                cFia.SEXO AS sexoFia,
                concat(cFia.ENDERECO, ' - ', cFia.BAIRRO, ' - ', cidFia.NOME, '-', cidFia.ESTADO) AS enderecoCompletoFia,
                cFia.ESTADO_CIVIL AS codEstadoCivilFia,
                
                CASE cFia.ESTADO_CIVIL 
                    WHEN 'C' THEN 'casado(a)' WHEN 'S' THEN 'solteiro(a)' WHEN 'V' THEN 'viúvo(a)'
                    WHEN 'D' THEN 'divorciado(a)' WHEN 'U' THEN 'em união estável' ELSE 'estado civil não informado' 
                END AS estadoCivilFia,
                
                CASE WHEN tdiFia.DESCRICAO LIKE '%Carteira de Identidade%' THEN 'RG' ELSE ISNULL(tdiFia.DESCRICAO, 'Doc') END AS tipoDocFia,
                cFia.DOCUMENTO AS documentoFia,
                ISNULL(proFia.DESCRICAO, 'profissão não informada') AS profissaoFia,
                ISNULL(cFia.NACIONALIDADE, 'brasileiro(a)') AS nacionalidadeFia,
                cFia.NOME_PAI AS paiFia,
                cFia.NOME_MAE AS maeFia,
                
                -- Cônjuge do Fiador
                cFia.NOME_CONJUGE AS conjugueFia,
                ISNULL(cFia.SEXO_CONJUGE, CASE WHEN cFia.SEXO = 'M' THEN 'F' ELSE 'M' END) AS sexoConjugeFia,
                CASE WHEN tdiConjFia.DESCRICAO LIKE '%Carteira de Identidade%' THEN 'RG' ELSE ISNULL(tdiConjFia.DESCRICAO, 'Doc') END AS tipoDocConjugeFia,
                cFia.DOCUMENTO_CONJUGE AS documentoConjugeFia,
                cFia.CPF_CONJUGE AS cpfConjugeFia,
                ISNULL(cFia.NACIONALIDADE_CONJUGE, 'brasileiro(a)') AS nacionalidadeConjugeFia,
                ISNULL(proConjFia.DESCRICAO, 'profissão não informada') AS profissaoConjugeFia	

            FROM cotas ct
            -- Joins do Comprador
            LEFT JOIN clientes c ON ct.cgc_cpf_cliente = c.CGC_CPF_CLIENTE AND ct.TIPO = c.TIPO
            LEFT JOIN PROFISSOES pro ON c.CODIGO_PROFISSAO = pro.CODIGO_PROFISSAO
            LEFT JOIN TIPOS_DOC_IDENTIFICACAO tdi ON c.CODIGO_TIPO_DOC_IDENT = tdi.CODIGO_TIPO_DOC_IDENT
            LEFT JOIN TIPOS_DOC_IDENTIFICACAO tdiConj ON c.CODIGO_TIPO_DOC_IDENT_CONJ = tdiConj.CODIGO_TIPO_DOC_IDENT
            LEFT JOIN PROFISSOES proConj ON c.CODIGO_PROFISSAO_CONJUGE = proConj.CODIGO_PROFISSAO
            LEFT JOIN CIDADES cid ON c.CODIGO_CIDADE = cid.CODIGO_CIDADE
            
            -- Joins do Fiador
            LEFT JOIN FIADORES fia ON ct.CODIGO_GRUPO = fia.CODIGO_GRUPO AND ct.CODIGO_COTA = fia.CODIGO_COTA AND ct.VERSAO = fia.VERSAO AND ct.TIPO = fia.TIPO
            LEFT JOIN clientes cFia ON fia.cgc_cpf_cliente = cFia.CGC_CPF_CLIENTE AND fia.TIPO = cFia.TIPO
            LEFT JOIN PROFISSOES proFia ON cFia.CODIGO_PROFISSAO = proFia.CODIGO_PROFISSAO
            LEFT JOIN TIPOS_DOC_IDENTIFICACAO tdiFia ON cFia.CODIGO_TIPO_DOC_IDENT = tdiFia.CODIGO_TIPO_DOC_IDENT
            LEFT JOIN TIPOS_DOC_IDENTIFICACAO tdiConjFia ON cFia.CODIGO_TIPO_DOC_IDENT_CONJ = tdiConjFia.CODIGO_TIPO_DOC_IDENT
            LEFT JOIN PROFISSOES proConjFia ON cFia.CODIGO_PROFISSAO_CONJUGE = proConjFia.CODIGO_PROFISSAO
            LEFT JOIN CIDADES cidFia ON cFia.CODIGO_CIDADE = cidFia.CODIGO_CIDADE
            
            WHERE ct.codigo_grupo = ${grupo}
            AND ct.CODIGO_COTA = ${cota}
            AND ct.VERSAO = ${versao}
        )

        SELECT 
            nome,
            cpf,
            email,
            -- ==========================================
            -- TEXTO DO COMPRADOR
            -- ==========================================
            CONCAT(
                nome, ', ', 
                tipoDoc, ' nº ', documento, ', CPF nº ', cpf, ', ',
                LOWER(profissao), ', ', LOWER(nacionalidade), ', plenamente capaz, ',
                CASE WHEN sexo = 'F' THEN 'filha' ELSE 'filho' END, ' de ', 
                ISNULL(pai, 'não declarado'), ' e ', ISNULL(mae, 'não declarada'), ', ',
                'endereço eletrônico ', ISNULL(email, 'não informado'), 
                
                CASE WHEN codEstadoCivil = 'C' AND conjugue IS NOT NULL THEN
                    CONCAT(
                        ' e ', CASE WHEN sexoConjuge = 'F' THEN 'sua esposa ' ELSE 'seu esposo ' END,
                        conjugue, ', ',
                        tipoDocConjuge, ' nº ', documentoConjuge, ', CPF nº ', cpfConjuge, ', ',
                        LOWER(nacionalidadeConjuge), ', ', LOWER(profissaoConjuge), ', plenamente capaz, ',
                        'filho(a) de [PAI_CONJUGE] e [MAE_CONJUGE], ',
                        '[EMAIL_CONJUGE], ',
                        'casados no regime de [REGIME_BENS] na vigência da Lei nº 6.515/77, em [DATA_CASAMENTO]'
                    )
                ELSE 
                    CONCAT(', ', estadoCivil) 
                END,
                
                CASE WHEN codEstadoCivil = 'C' THEN concat(', residentes na ', enderecoCompleto) ELSE concat(', residente na ', enderecoCompleto) END, '.'
            ) AS textoComprador,

            -- ==========================================
            -- TEXTO DO FIADOR (Se existir)
            -- ==========================================
            CASE WHEN nomeFia IS NULL THEN NULL
            ELSE
                CONCAT(
                    nomeFia, ', ', 
                    tipoDocFia, ' nº ', documentoFia, ', CPF/MF ', cpfFia, ', ',
                    LOWER(profissaoFia), ', ', LOWER(nacionalidadeFia), ', plenamente capaz, ',
                    CASE WHEN sexoFia = 'F' THEN 'filha' ELSE 'filho' END, ' de ', 
                    ISNULL(paiFia, 'não declarado'), ' e ', ISNULL(maeFia, 'não declarada'), ', ',
                    'endereço eletrônico ', ISNULL(emailFia, 'não informado'), 
                    
                    CASE WHEN codEstadoCivilFia = 'C' AND conjugueFia IS NOT NULL THEN
                        CONCAT(
                            ' e ', CASE WHEN sexoConjugeFia = 'F' THEN 'sua esposa ' ELSE 'seu esposo ' END,
                            conjugueFia, ', ',
                            tipoDocConjugeFia, ' nº ', documentoConjugeFia, ', CPF/MF ', cpfConjugeFia, ', ',
                            LOWER(nacionalidadeConjugeFia), ', ', LOWER(profissaoConjugeFia), ', capaz, ',
                            'filho(a) de [PAI_CONJUGE_FIA] e [MAE_CONJUGE_FIA], ',
                            'casados no regime de [REGIME_BENS_FIA], nos termos da Escritura de Pacto Antenupcial lavrada no [TABELIAO_CARTORIO_FIA] em [DATA_CASAMENTO_FIA]'
                        )
                    ELSE 
                        CONCAT(', ', estadoCivilFia) 
                    END,
                    
                    CASE WHEN codEstadoCivilFia = 'C' THEN concat(', residentes na ', enderecoCompletoFia) ELSE concat(', residente na ', enderecoCompletoFia) END, '.'
                )
            END AS textoFiador

        FROM DadosCliente;
    `,
    );
    return result;
  };

FormulariosGeracaoDocs.prototype.formularioContratoVendaImovelCotas =
  async function (req) {
    let doc = req.query.doc;
    let result = await this._connection(
      `
      SELECT 
            ct.codigo_grupo AS grupo,
            ct.CODIGO_COTA AS cota,
            ct.VERSAO AS versao,
            ct.NUMERO_CONTRATO AS contrato,

            CONVERT(VARCHAR(10), ct.DATA_venda, 103) AS dataAdesao,

            CONVERT(VARCHAR(10), ct.DATA_CONTEMPLACAO, 103) AS dataContemplacao,

            FORMAT(vbc.VALOR_CORRECAO, 'C', 'pt-BR') AS creditoCorrigido,

            FORMAT(
                (((100 - ct.PERCENTUAL_IDEAL_DEVIDO) 
                + (ct.PERCENTUAL_TAXA_ADMINISTRACAO - ct.TAXA_ADMINISTRACAO_PAGA)) 
                * vb.PRECO_TABELA) / 100,
            'C', 'pt-BR') AS saldoDevedor,

            (ct.PERCENTUAL_IDEAL_DEVIDO + ct.PE_TA) AS percentualAmortizado,

            ((100 + ct.PERCENTUAL_TAXA_ADMINISTRACAO) 
            - (ct.PERCENTUAL_IDEAL_DEVIDO + ct.PE_TA)) AS percentualAAmortizar,

            (100 + ct.PERCENTUAL_TAXA_ADMINISTRACAO) AS percentualTotal,

            ct.PERCENTUAL_TAXA_ADMINISTRACAO AS percentualTaxa,

            pa.qtdParcelas AS parcelasAbertas,

            FORMAT(vpp.proximaParcela, 'C', 'pt-BR') AS proximaParcela,

            CONVERT(VARCHAR(10), vpp.dataVencimento, 103) AS vencimentoProximaParcela,

            CONVERT(VARCHAR(10),
                DATEADD(MONTH, pa.qtdParcelas - 1, vpp.dataVencimento),
            103) AS dataUltimaParcela,

            cast(vpp.amortizacaoMensal as decimal(10,4)) as amortizacaoMensal

        FROM cotas ct

        OUTER APPLY (
            SELECT TOP 1 vcc.VALOR_CORRECAO
            FROM [NewconPlus].[dbo].[vw_Correcoes_Creditos] vcc
            WHERE vcc.CODIGO_GRUPO = ct.codigo_grupo 
            AND vcc.CODIGO_COTA = ct.CODIGO_COTA 
            AND vcc.VERSAO = ct.VERSAO
            ORDER BY vcc.DATA_BASE_CORRECAO DESC
        ) vbc

        OUTER APPLY (
            SELECT TOP 1 rb.preco_tabela
            FROM REAJUSTES_BENS rb
            WHERE rb.CODIGO_BEM = ct.codigo_bem
            ORDER BY rb.DATA_REAJUSTE DESC
        ) vb

        OUTER APPLY (
            SELECT COUNT(*) AS qtdParcelas
            FROM COBRANCAS_ESPECIAIS ce
            WHERE ce.CODIGO_GRUPO = ct.CODIGO_GRUPO 
            AND ce.CODIGO_COTA = ct.CODIGO_COTA 
            AND ce.VERSAO = ct.VERSAO
            AND ce.STATUS_PARCELA = 'N'
        ) pa

        OUTER APPLY (
            SELECT TOP 1 
                (cob.VALOR_FUNDO_COMUM + cob.VALOR_TAXA_ADMINISTRACAO) AS proximaParcela,
                cob.DATA_VENCIMENTO AS dataVencimento,
                ((cob.VALOR_TAXA_ADMINISTRACAO * 100.0) / NULLIF(cob.VALOR_BEM,0) 
                    + cob.PERCENTUAL_NORMAL) AS amortizacaoMensal
            FROM COBRANCAS cob
            WHERE cob.CODIGO_GRUPO = ct.CODIGO_GRUPO
            AND cob.CODIGO_COTA = ct.CODIGO_COTA
            AND cob.VERSAO = ct.VERSAO
            AND cob.DATA_VENCIMENTO >= CAST(GETDATE() AS DATE)
            ORDER BY cob.DATA_VENCIMENTO
        ) vpp

        WHERE ct.CGC_CPF_CLIENTE = '${doc}';    
  `,
    );
    return result;
  };

module.exports = function () {
  return FormulariosGeracaoDocs;
};
