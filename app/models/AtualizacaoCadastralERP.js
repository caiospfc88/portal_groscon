// app/models/AtualizacaoCadastralERP.js

function AtualizacaoCadastralERP(connection) {
  this._connection = connection;
}

AtualizacaoCadastralERP.prototype.buscarDadosCliente = async function (
  cpfCnpj,
) {
  // Limpa a string para garantir que a busca no ERP seja exata
  const docLimpo = cpfCnpj.replace(/\D/g, "");

  let result = await this._connection(`
    SELECT TOP 1 
      c.CGC_CPF_CLIENTE 'CPF/CNPJ',
      AJ.DESCRICAO AS 'ATIVIDADE JURÍDICA',
      c.NOME,
      c.ENDERECO AS 'ENDEREÇO',
      c.BAIRRO,
      cid.NOME as 'CIDADE',
      c.CEP,
      -- TELEFONE 1
      CASE 
          WHEN NULLIF(LTRIM(RTRIM(c.CELULAR)), '') IS NOT NULL 
          THEN 
              CASE 
                  WHEN NULLIF(LTRIM(RTRIM(c.DDD_RESIDENCIAL)), '') IS NOT NULL 
                  THEN CONCAT(CAST(TRY_CAST(c.DDD_RESIDENCIAL AS INT) AS VARCHAR), 
                       CASE 
                           WHEN LTRIM(RTRIM(c.CELULAR)) LIKE '0[0-9][0-9]%' AND LEN(REPLACE(REPLACE(c.CELULAR, '-', ''), ' ', '')) >= 10 
                               THEN SUBSTRING(LTRIM(RTRIM(c.CELULAR)), 4, LEN(c.CELULAR))
                           WHEN LTRIM(RTRIM(c.CELULAR)) LIKE '[1-9][1-9]%' AND LEN(REPLACE(REPLACE(c.CELULAR, '-', ''), ' ', '')) >= 10 
                               THEN SUBSTRING(LTRIM(RTRIM(c.CELULAR)), 3, LEN(c.CELULAR))
                           ELSE LTRIM(RTRIM(REPLACE(c.CELULAR, '-', '')))
                       END)
                  WHEN LTRIM(RTRIM(c.CELULAR)) LIKE '0[0-9][0-9]%' AND LEN(REPLACE(REPLACE(c.CELULAR, '-', ''), ' ', '')) >= 10 
                  THEN SUBSTRING(LTRIM(RTRIM(REPLACE(REPLACE(c.CELULAR, '-', ''), ' ', ''))), 2, LEN(c.CELULAR))
                  ELSE LTRIM(RTRIM(REPLACE(REPLACE(c.CELULAR, '-', ''), ' ', '')))
              END
          ELSE '' 
      END AS phone_1,

      -- TELEFONE 2
      CASE 
          WHEN NULLIF(LTRIM(RTRIM(c.FONE_FAX)), '') IS NOT NULL 
          THEN 
              CASE 
                  WHEN NULLIF(LTRIM(RTRIM(c.DDD_RESIDENCIAL)), '') IS NOT NULL 
                  THEN CONCAT(CAST(TRY_CAST(c.DDD_RESIDENCIAL AS INT) AS VARCHAR), 
                       CASE 
                           WHEN LTRIM(RTRIM(c.FONE_FAX)) LIKE '0[0-9][0-9]%' AND LEN(REPLACE(REPLACE(c.FONE_FAX, '-', ''), ' ', '')) >= 10 
                               THEN SUBSTRING(LTRIM(RTRIM(c.FONE_FAX)), 4, LEN(c.FONE_FAX))
                           WHEN LTRIM(RTRIM(c.FONE_FAX)) LIKE '[1-9][1-9]%' AND LEN(REPLACE(REPLACE(c.FONE_FAX, '-', ''), ' ', '')) >= 10 
                               THEN SUBSTRING(LTRIM(RTRIM(c.FONE_FAX)), 3, LEN(c.FONE_FAX))
                           ELSE LTRIM(RTRIM(REPLACE(c.FONE_FAX, '-', '')))
                       END)
                  WHEN LTRIM(RTRIM(c.FONE_FAX)) LIKE '0[0-9][0-9]%' AND LEN(REPLACE(REPLACE(c.FONE_FAX, '-', ''), ' ', '')) >= 10 
                  THEN SUBSTRING(LTRIM(RTRIM(REPLACE(REPLACE(c.FONE_FAX, '-', ''), ' ', ''))), 2, LEN(c.FONE_FAX))
                  ELSE LTRIM(RTRIM(REPLACE(REPLACE(c.FONE_FAX, '-', ''), ' ', '')))
              END
          ELSE '' 
      END AS phone_2,

      -- PHONE 3: Telefone Comercial
      CASE 
          WHEN NULLIF(LTRIM(RTRIM(c.FONE_FAX_COMERCIAL)), '') IS NOT NULL AND NULLIF(LTRIM(RTRIM(c.DDD_COMERCIAL)), '') IS NOT NULL 
          THEN CONCAT('+55', CAST(TRY_CAST(c.DDD_COMERCIAL AS INT) AS VARCHAR),
               CASE 
                   WHEN LTRIM(RTRIM(c.FONE_FAX_COMERCIAL)) LIKE '0[0-9][0-9]%' AND LEN(REPLACE(REPLACE(c.FONE_FAX_COMERCIAL, '-', ''), ' ', '')) >= 10 
                       THEN SUBSTRING(LTRIM(RTRIM(c.FONE_FAX_COMERCIAL)), 4, LEN(c.FONE_FAX_COMERCIAL))
                   WHEN LTRIM(RTRIM(c.FONE_FAX_COMERCIAL)) LIKE '[1-9][1-9]%' AND LEN(REPLACE(REPLACE(c.FONE_FAX_COMERCIAL, '-', ''), ' ', '')) >= 10 
                       THEN SUBSTRING(LTRIM(RTRIM(c.FONE_FAX_COMERCIAL)), 3, LEN(REPLACE(c.FONE_FAX_COMERCIAL, '-', '')))
                   ELSE LTRIM(RTRIM(REPLACE(c.FONE_FAX_COMERCIAL, '-', '')))
               END)
          ELSE '' 
      END AS phone_3,
      format(c.DATA_NASCIMENTO,'dd/MM/yyyy', 'en-US') as 'DATA DE NASCIMENTO',
      c.NACIONALIDADE,
      c.DOCUMENTO,
      c.SIGILO,
      (CASE WHEN C.SEXO = 'F' THEN 'FEMININO' ELSE 
      (CASE WHEN C.SEXO = 'M' THEN 'MASCULINO' ELSE 
      (CASE WHEN C.SEXO = 'A' THEN '--------------' END)END) END) AS 'SEXO',
      (CASE WHEN C.ESTADO_CIVIL = 'C' THEN 'CASADO' ELSE 
      (CASE WHEN C.ESTADO_CIVIL = 'S' THEN 'SOLTEIRO' ELSE
      (CASE WHEN C.ESTADO_CIVIL = 'V' THEN 'VIUVO' ELSE
      (CASE WHEN C.ESTADO_CIVIL = 'D' THEN 'DIVORCIADO' ELSE
      (CASE WHEN C.ESTADO_CIVIL = 'U' THEN 'UNIÃO ESTAVEL' ELSE
      (CASE WHEN C.ESTADO_CIVIL = 'A' THEN '--------------' END)END) END) END) END) END) AS 'ESTADO CIVIL',
      p.DESCRICAO as 'PROFISSÃO',
      c.ENDERECO_COMERCIAL as 'ENDEREÇO (COMERCIAL)',
      c.BAIRRO_COMERCIAL as 'BAIRRO (COMERCIAL)',
      c.COMPLEMENTO_COMERCIAL as 'COMPLEMENTO (COMERCIAL)',
      c.CODIGO_CIDADE_COMERCIAL as 'CÓDIGO DA CIDADE (COMERCIAL)',
      c.CEP_COMERCIAL as 'CEP (COMERCIAL)',
      C.NOME_CONJUGE as 'NOME (CÔNJUGUE)',
      c.DOCUMENTO_CONJUGE AS 'DOCUMENTO (CÔNJUGUE)',
      C.NACIONALIDADE_CONJUGE AS 'NACIONALIDADE (CÔNJUGUE)',
      C.CPF_CONJUGE AS 'CPF (CONJUGUE)',
      format(c.DATA_NASCIMENTO_CONJUGE,'dd/MM/yyyy', 'en-US') as 'DATA DE NASCIMENTO (CÔNJUGUE)',
      (select P.DESCRICAO from PROFISSOES where CODIGO_PROFISSAO = c.CODIGO_PROFISSAO_CONJUGE) AS 'PROFISSÃO (CÔNJUGUE)',
      c.ENDERECO_OUTRO as 'ENDEREÇO ALTERNATIVO',
      c.BAIRRO_OUTRO as 'BAIRRO ALTERNATIVO',
      C.COMPLEMENTO_OUTRO AS 'COMPLEMENTO ALTERNATIVO',
      C.CEP_OUTRO AS 'CEP ALTERNATIVO',
      c.E_MAIL as 'E-mail',
      C.CODIGO_CIDADE_OUTRO 'CÓDIGO DA CIDADE ALTERNATIVO',
      C.CAIXA_POSTAL AS 'CAIXA POSTAL',
      C.CAIXA_POSTAL_COMERCIAL AS 'CAIXA POSTAL COMERCIAL',
      C.CAIXA_POSTAL_OUTRO AS 'CAIXA POSTAL ALTERNATIVO',
      (CASE WHEN C.NIVEL_ENSINO = 1 THEN 'FUNDAMENTAL' ELSE 
      (CASE WHEN C.NIVEL_ENSINO = 2 THEN 'MÉDIO' ELSE
      (CASE WHEN C.NIVEL_ENSINO = 3 THEN 'SUPERIOR' ELSE
      (CASE WHEN C.NIVEL_ENSINO = 4 THEN 'PÓS DOUTORADO' ELSE
      (CASE WHEN C.NIVEL_ENSINO = 5 THEN 'NENHUM' ELSE
      (CASE WHEN C.NIVEL_ENSINO is null THEN '--------------' END)END) END) END) END) END) AS 'NÍVEL DE ENSINO',
      C.ORGAO_EMISSOR AS 'ORGÃO EMISSOR',
      C.ORGAO_EMISSOR_CONJUGE AS 'ORGÃO EMISSOR (CÔNJUGUE)',
      C.LIMITE_CREDITO as 'LIMITE DE CRÉDITO',
      C.CELULAR,
      C.RENDA AS 'RENDA',
      C.NOME_PAI AS 'NOME DO PAI',
      C.NOME_MAE AS 'NOME DA MÃE',
      C.NATURALIDADE,
      C.NATURALIDADE_CONJUGE AS 'NATURALIDADE DO CÔNJUGUE',
      C.NUMERO_DEPENDENTES AS 'NÚMERO DE DEPENDENTES',
      C.UF_DOC_CLIENTE AS 'UF DO DOCUMENTO',
      C.UF_DOC_CONJUGE AS 'UF DO DOC. CÔNJUGUE',
      REG.DESCRICAO AS 'REGIME DO CASAMENTO',
      C.SEXO_CONJUGE AS 'SEXO DO CÔNJUGUE',
      DOC.DESCRICAO AS 'DOCUMENTO DE INDENTIFICAÇÃO',
      (select DISTINCT DOC.DESCRICAO from TIPOS_DOC_IDENTIFICACAO where DOC.CODIGO_TIPO_DOC_IDENT = C.CODIGO_TIPO_DOC_IDENT_CONJ) AS 'DOC. DE INDENTIFICAÇÃO DO CÔNJUGUE',
      format(C.DATA_EXP_DOC,'dd/MM/yyyy', 'en-US') as 'DATA DE EXPEDIÇÃO',
      format(C.DATA_EXP_DOC_CONJUGE,'dd/MM/yyyy', 'en-US') as 'DATA DE EXPEDIÇÃO (CÔNJUGUE)',
      C.Endereco_Conjuge AS 'ENDEREÇO DO CÔNJUGUE'
    FROM CLIENTES c 
    LEFT JOIN PROFISSOES p on c.CODIGO_PROFISSAO = p.CODIGO_PROFISSAO 
    LEFT JOIN REGIMES_CASAMENTO REG ON C.REGIME_CASAMENTO = REG.REGIME_CASAMENTO 
    LEFT JOIN ATIVIDADES_JURIDICAS AJ ON C.CODIGO_ATIVIDADE_JURIDICA = AJ.CODIGO_ATIVIDADE_JURIDICA
    LEFT JOIN TIPOS_DOC_IDENTIFICACAO DOC on C.CODIGO_TIPO_DOC_IDENT = DOC.CODIGO_TIPO_DOC_IDENT
    LEFT JOIN CIDADES cid on c.CODIGO_CIDADE = cid.CODIGO_CIDADE
    WHERE c.CGC_CPF_CLIENTE = '${docLimpo}'
  `);

  return result && result.length > 0 ? result[0] : null;
};

module.exports = function () {
  return AtualizacaoCadastralERP;
};
