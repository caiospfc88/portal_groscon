function ConsultasDAO(connection) {
  this._connection = connection;
}

ConsultasDAO.prototype.getComissoesSemReducao = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let periodo = req.query.periodo;
  let opcao = req.query.opcao;
  let codigo = req.query.codigo;

  var complemento = "";
  if (opcao == 2) {
    complemento = `and ((nivel1.CODIGO_EQUIPE = ${codigo}) or (nivel2.CODIGO_EQUIPE = ${codigo}) or (nivel3.CODIGO_EQUIPE = ${codigo}) or (nivel4.CODIGO_EQUIPE = ${codigo}))`;
  } else {
    complemento = `and ((nivel1.CODIGO_REPRESENTANTE = ${codigo}) or (nivel2.CODIGO_REPRESENTANTE = ${codigo}) or (nivel3.CODIGO_REPRESENTANTE = ${codigo}) or (nivel4.CODIGO_REPRESENTANTE = ${codigo}))`;
  }
  var result1 = await this._connection(
    `select distinct
    ct.CODIGO_GRUPO as GRUPO
    ,ct.CODIGO_COTA as COTA
    ,ct.VERSAO AS VS
    ,mg.DATA_PAGAMENTO AS DT_PAG
    ,mg.DATA_CONTABILIZACAO AS DT_CONT
    ,mg.VALOR_TAXA_ADMINISTRACAO AS VL_TX_ADM
    ,mg.VALOR_BEM AS VL_BEM
    ,(mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) as NUM_PAR
    ,ct.CODIGO_TABELA_COMISSAO AS COD_TAB_COM
    ,QUANTIDADE_PARCELAS.NUMERO_PARCELAS_MAXIMO AS MAX_COM
    ,RP.CODIGO_EQUIPE AS COD_EQ
    ,nivel1.CODIGO_REPRESENTANTE AS N1_COD
    ,nivel1.NUMERO_PARCELAS_MAXIMO as N1_MAXIMO
    ,nivel1.DESCRICAO as N1_DESCRICAO
    ,nivel1.PERC_COMISSAO as PERC_COM_N1
    ,case
       when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' THEN nivel1.PERC_COMISSAO*PP.VALOR_BEM/100
           else nivel1.PERC_COMISSAO*mg.VALOR_BEM/100
     end as VAL_N1
    ,nivel2.CODIGO_REPRESENTANTE AS N2_COD
    ,nivel2.NUMERO_PARCELAS_MAXIMO as N2_MAXIMO
    ,nivel2.DESCRICAO as N2_DESCRICAO
    ,nivel2.PERC_COMISSAO as PERC_COM_N2
    ,case
       when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' THEN nivel2.PERC_COMISSAO*PP.VALOR_BEM/100
           else nivel2.PERC_COMISSAO*mg.VALOR_BEM/100
     end as VAL_N2
    ,nivel3.CODIGO_REPRESENTANTE AS N3_COD
    ,nivel3.NUMERO_PARCELAS_MAXIMO as N3_MAXIMO
    ,nivel3.DESCRICAO as N3_DESCRICAO
    ,nivel3.PERC_COMISSAO as PERC_COM_N3
    ,case
       when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' THEN nivel3.PERC_COMISSAO*PP.VALOR_BEM/100
           else nivel3.PERC_COMISSAO*mg.VALOR_BEM/100
     end as VAL_N3
    ,nivel4.CODIGO_REPRESENTANTE AS N4_COD
    ,nivel4.NUMERO_PARCELAS_MAXIMO as N4_MAXIMO
    ,nivel4.DESCRICAO as N4_DESCRICAO
    ,nivel4.PERC_COMISSAO as PERC_COM_N4
    ,case
       when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' THEN nivel4.PERC_COMISSAO*PP.VALOR_BEM/100
           else nivel4.PERC_COMISSAO*mg.VALOR_BEM/100
     end as VAL_N4
    ,ct.CODIGO_REPRESENTANTE
    ,ct.DATA_VENDA
    ,pp.VALOR_BEM as VAL_BEM_VEND
    ,pp.VALOR_BEM*-1 as VAL_BEM_VEND
    ,TOTAL_VENDAS.total as TOTAL_VENDAS_MES
    ,mg.CODIGO_MOVIMENTO
  from 
    COTAS ct inner join MOVIMENTOS_GRUPOS mg on
      ct.CODIGO_GRUPO = mg.CODIGO_GRUPO
      and ct.CODIGO_COTA = mg.CODIGO_COTA
      and ct.VERSAO = mg.VERSAO
    inner join REPRESENTANTES rp on
      rp.CODIGO_REPRESENTANTE = ct.CODIGO_REPRESENTANTE
    inner join CATEGORIAS_REPRESENTANTES ctr on
      case 
        when rp.CODIGO_CATEGORIA is null 
        then rp.CODIGO_CATEGORIA_SUPERVISAO
        else rp.CODIGO_CATEGORIA
        end = ctr.CODIGO_CATEGORIA
    inner join PROPOSTAS pp on
      pp.NUMERO_CONTRATO = ct.NUMERO_CONTRATO
    inner join PERIODOS_COMISSOES pc on
      pc.CODIGO_PERIODO = rp.CODIGO_PERIODO or mg.DATA_CONTABILIZACAO between pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL
      outer apply(
       select
       TOP 1 (pc.DATA_CONTABILIZACAO_INICIAL) AS DATA_INICIAL_VENDA
       from
       PERIODOS_COMISSOES pc
       where
       CODIGO_PERIODO = ${periodo}
       and DATA_CONTABILIZACAO_INICIAL <= ct.DATA_VENDA
       ORDER BY PC.DATA_CONTABILIZACAO_INICIAL DESC
     ) PC_DT1
     outer apply(
       select
       TOP 1 (pc.DATA_CONTABILIZACAO_FINAL) AS DATA_FINAL_VENDA
       from
       PERIODOS_COMISSOES pc
       where
       CODIGO_PERIODO = ${periodo}
       and DATA_CONTABILIZACAO_FINAL >= ct.DATA_VENDA
       ORDER BY PC.DATA_CONTABILIZACAO_INICIAL
     ) PC_DT2
     outer apply
             (
                select 
                  SUM(pp.VALOR_BEM) as total 
                from 
                  PROPOSTAS pp 
                where 
                  pp.DATA_VENDA between PC_DT1.DATA_INICIAL_VENDA and PC_DT2.DATA_FINAL_VENDA
                  and pp.CODIGO_REPRESENTANTE = ct.CODIGO_REPRESENTANTE
              ) as TOTAL_VENDAS
     outer apply
              (select top 1 pce.PERCENTUAL_NORMAL from COBRANCAS_ESPECIAIS ce inner join PERC_COBRANCAS_ESPECIAIS pce 
                on ce.CODIGO_COBRANCA_ESPECIAL = pce.CODIGO_COBRANCA_ESPECIAL
                where ce.CODIGO_GRUPO = ct.CODIGO_GRUPO and ce.CODIGO_COTA = ct.CODIGO_COTA and ce.VERSAO = ct.VERSAO
                order by ce.PARCELA desc
              ) as Perc_reduz       
    outer apply
    (select
      case 
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_1  THEN cc.PERC_1
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_2  THEN cc.PERC_2
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_3  THEN cc.PERC_3
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_4  THEN cc.PERC_4
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_5  THEN cc.PERC_5
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_6  THEN cc.PERC_6
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_7  THEN cc.PERC_7
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_8  THEN cc.PERC_8
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_9  THEN cc.PERC_9
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_10  THEN cc.PERC_10
      END AS PERC_COMISSAO  
      ,cc.NUMERO_PARCELA
      ,cc.PERC_1
      ,ctr.DESCRICAO
      ,rp.CODIGO_REPRESENTANTE
      ,rp.CODIGO_ENCARREGADO
      ,rp.CODIGO_EQUIPE
      ,QPC.NUMERO_PARCELAS_MAXIMO
     from 
      COMISSOES_CATEGORIAS cc
      outer apply
       (select 
           max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO 
           from COMISSOES_CATEGORIAS 
           where 
               NUMERO_PARCELA < 500 
               AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
               and case when RP.CODIGO_CATEGORIA IS NULL THEN RP.CODIGO_CATEGORIA_SUPERVISAO ELSE RP.CODIGO_CATEGORIA END = CODIGO_CATEGORIA
           ) as QPC
     where 
      cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
      and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
      and case when RP.CODIGO_CATEGORIA IS NULL THEN RP.CODIGO_CATEGORIA_SUPERVISAO ELSE RP.CODIGO_CATEGORIA END = CC.CODIGO_CATEGORIA
     ) as nivel1
     outer apply
     (select rp2.CODIGO_REPRESENTANTE, rp2.CODIGO_ENCARREGADO, rp2.CODIGO_CATEGORIA, rp2.CODIGO_CATEGORIA_SUPERVISAO, rp2.CODIGO_EQUIPE from REPRESENTANTES rp2 where rp2.CODIGO_REPRESENTANTE = rp.CODIGO_ENCARREGADO) as rep2
     outer apply
      (select
      case 
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_1  THEN cc.PERC_1
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_2  THEN cc.PERC_2
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_3  THEN cc.PERC_3
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_4  THEN cc.PERC_4
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_5  THEN cc.PERC_5
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_6  THEN cc.PERC_6
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_7  THEN cc.PERC_7
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_8  THEN cc.PERC_8
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_9  THEN cc.PERC_9
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_10  THEN cc.PERC_10
      END AS PERC_COMISSAO 
      ,cc.NUMERO_PARCELA
      ,cc.PERC_1
      ,rep2.CODIGO_CATEGORIA_SUPERVISAO
      ,rep2.CODIGO_REPRESENTANTE
      ,rep2.CODIGO_ENCARREGADO
      ,rep2.CODIGO_EQUIPE
      ,cr.DESCRICAO
      ,QPC.NUMERO_PARCELAS_MAXIMO 
     from 
      COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
      cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
      outer apply
       (select 
           max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO 
           from COMISSOES_CATEGORIAS 
           where 
               NUMERO_PARCELA < 500 
               AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
               and case when rep2.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep2.CODIGO_CATEGORIA ELSE rep2.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
           ) as QPC
     where 
      cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
      and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
      and case when rep2.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep2.CODIGO_CATEGORIA ELSE rep2.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
     ) as nivel2
     outer apply
     (select rp3.CODIGO_REPRESENTANTE, rp3.CODIGO_ENCARREGADO, rp3.CODIGO_CATEGORIA, rp3.CODIGO_CATEGORIA_SUPERVISAO, rp3.CODIGO_EQUIPE from REPRESENTANTES rp3 where rp3.CODIGO_REPRESENTANTE = rep2.CODIGO_ENCARREGADO) as rep3
     outer apply
      (select 
      cc.NUMERO_PARCELA
      ,case 
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_1  THEN cc.PERC_1
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_2  THEN cc.PERC_2
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_3  THEN cc.PERC_3
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_4  THEN cc.PERC_4
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_5  THEN cc.PERC_5
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_6  THEN cc.PERC_6
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_7  THEN cc.PERC_7
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_8  THEN cc.PERC_8
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_9  THEN cc.PERC_9
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_10  THEN cc.PERC_10
      END AS PERC_COMISSAO 
      ,cc.PERC_1
      ,rep3.CODIGO_CATEGORIA_SUPERVISAO
      ,rep3.CODIGO_REPRESENTANTE
      ,rep3.CODIGO_ENCARREGADO
      ,rep3.codigo_equipe
      ,cr.DESCRICAO
      ,qpc.NUMERO_PARCELAS_MAXIMO
     from 
      COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
      cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
      outer apply
       (select 
           max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO 
           from COMISSOES_CATEGORIAS 
           where 
               NUMERO_PARCELA < 500 
               AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
               and case when rep3.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep3.CODIGO_CATEGORIA ELSE Rep3.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
           ) as QPC
     where 
      cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
      and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
      and case when rep3.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep3.CODIGO_CATEGORIA ELSE Rep3.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
     ) as nivel3
     outer apply
     (select rp4.CODIGO_REPRESENTANTE, rp4.CODIGO_ENCARREGADO, rp4.CODIGO_CATEGORIA, rp4.CODIGO_CATEGORIA_SUPERVISAO, rp4.CODIGO_EQUIPE from REPRESENTANTES rp4 where rp4.CODIGO_REPRESENTANTE = rep3.CODIGO_ENCARREGADO) as rep4
     outer apply
      (select 
      case 
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_1  THEN cc.PERC_1
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_2  THEN cc.PERC_2
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_3  THEN cc.PERC_3
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_4  THEN cc.PERC_4
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_5  THEN cc.PERC_5
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_6  THEN cc.PERC_6
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_7  THEN cc.PERC_7
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_8  THEN cc.PERC_8
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_9  THEN cc.PERC_9
        WHEN TOTAL_VENDAS.total <= cc.FAIXA_10  THEN cc.PERC_10
      END AS PERC_COMISSAO 
      ,cc.NUMERO_PARCELA
      ,cc.PERC_1
      ,rep4.CODIGO_CATEGORIA_SUPERVISAO
      ,rep4.CODIGO_REPRESENTANTE
      ,rep4.CODIGO_ENCARREGADO
      ,rep4.CODIGO_EQUIPE
      ,cr.DESCRICAO
      ,qpc.NUMERO_PARCELAS_MAXIMO 
     from 
      COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
      cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
      outer apply
       (select 
           max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO 
           from COMISSOES_CATEGORIAS 
           where 
               NUMERO_PARCELA < 500 
               AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
               and case when rep4.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep4.CODIGO_CATEGORIA ELSE Rep4.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
           ) as QPC
     where 
      cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
      and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
      and case when rep4.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep4.CODIGO_CATEGORIA ELSE Rep4.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
     ) as nivel4
     outer apply
     (select max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO from COMISSOES_CATEGORIAS where NUMERO_PARCELA < 500 AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO) as QUANTIDADE_PARCELAS

  where
    mg.CODIGO_MOVIMENTO in ('010','011') ` +
      complemento +
      ` and ct.VERSAO < '40'
    and mg.DATA_CONTABILIZACAO between '${data_inicial}' and '${data_final}'
    and ct.DATA_VENDA between pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL
    and (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) <= QUANTIDADE_PARCELAS.NUMERO_PARCELAS_MAXIMO
  order by
    ct.CODIGO_GRUPO
    ,ct.CODIGO_COTA
    ,ct.VERSAO`
  );

  var result2;

  if (opcao == 1) {
    result2 = await this._connection(`
         select 
           rp.CODIGO_REPRESENTANTE, 
           rp.NOME, 
           rp.CODIGO_CATEGORIA,
           cr.DESCRICAO AS DESCRICAO_CATEGORIA,
           rp.CODIGO_CATEGORIA_SUPERVISAO, 
           cs.DESCRICAO AS DESCRICAO_SUPERVISAO,
           rp.CODIGO_ENCARREGADO,
           RC.NOME AS NOME_ENCARREGADO
         from 
           REPRESENTANTES rp
           outer apply(
           select 
           * 
           from 
           CATEGORIAS_REPRESENTANTES cr
           where
           cr.CODIGO_CATEGORIA = rp.CODIGO_CATEGORIA ) as cr
           outer apply(
           select 
           * 
           from 
           CATEGORIAS_REPRESENTANTES cr
           where
           cr.CODIGO_CATEGORIA = rp.CODIGO_CATEGORIA_SUPERVISAO ) as cs
           outer apply(
             select
             NOME
             from
             REPRESENTANTES rpp
             where
             rpp.CODIGO_REPRESENTANTE = rp.CODIGO_ENCARREGADO) as rc
           where 
             rp.CODIGO_REPRESENTANTE = ${codigo}`);
  } else {
    result2 = await this._connection(`
           select
           eq.CODIGO_EQUIPE
           ,eq.DESCRICAO
           from
           EQUIPES_VENDAS eq
           where
           eq.CODIGO_EQUIPE = ${codigo}`);
  }

  var result = result1.concat(result2);
  return result;
};

ConsultasDAO.prototype.getComissoesComReducao = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let periodo = req.query.periodo;
  let opcao = req.query.opcao;
  let codigo = req.query.codigo;

  var complemento = "";
  if (opcao == 2) {
    complemento = `and ((nivel1.CODIGO_EQUIPE = ${codigo}) or (nivel2.CODIGO_EQUIPE = ${codigo}) or (nivel3.CODIGO_EQUIPE = ${codigo}) or (nivel4.CODIGO_EQUIPE = ${codigo}))`;
  } else {
    complemento = `and ((nivel1.CODIGO_REPRESENTANTE = ${codigo}) or (nivel2.CODIGO_REPRESENTANTE = ${codigo}) or (nivel3.CODIGO_REPRESENTANTE = ${codigo}) or (nivel4.CODIGO_REPRESENTANTE = ${codigo}))`;
  }
  var result1 = await this._connection(
    `select distinct
                                            ct.CODIGO_GRUPO as GRUPO
                                            ,ct.CODIGO_COTA as COTA
                                            ,ct.VERSAO AS VS
                                            ,mg.DATA_PAGAMENTO AS DT_PAG
                                            ,mg.DATA_CONTABILIZACAO AS DT_CONT
                                            ,mg.VALOR_TAXA_ADMINISTRACAO AS VL_TX_ADM
                                            ,mg.VALOR_BEM AS VL_BEM
                                            ,(mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) as NUM_PAR
                                            ,ct.CODIGO_TABELA_COMISSAO AS COD_TAB_COM
                                            ,QUANTIDADE_PARCELAS.NUMERO_PARCELAS_MAXIMO AS MAX_COM
                                            ,RP.CODIGO_EQUIPE AS COD_EQ
                                            ,nivel1.CODIGO_REPRESENTANTE AS N1_COD
                                            ,nivel1.NUMERO_PARCELAS_MAXIMO as N1_MAXIMO
                                            ,nivel1.DESCRICAO as N1_DESCRICAO
                                            ,nivel1.PERC_COMISSAO as PERC_COM_N1
                                            ,case
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 then nivel1.PERC_COMISSAO*PP.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.50)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel1.PERC_COMISSAO*mg.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100)
                                            else nivel1.PERC_COMISSAO*mg.VALOR_BEM/100
                                            end as VAL_N1
                                            ,nivel2.CODIGO_REPRESENTANTE AS N2_COD
                                            ,nivel2.NUMERO_PARCELAS_MAXIMO as N2_MAXIMO
                                            ,nivel2.DESCRICAO as N2_DESCRICAO
                                            ,nivel2.PERC_COMISSAO as PERC_COM_N2
                                            ,case
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel2.PERC_COMISSAO*PP.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.50)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel1.PERC_COMISSAO*mg.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100)
                                            else nivel2.PERC_COMISSAO*mg.VALOR_BEM/100
                                            end as VAL_N2
                                            ,nivel3.CODIGO_REPRESENTANTE AS N3_COD
                                            ,nivel3.NUMERO_PARCELAS_MAXIMO as N3_MAXIMO
                                            ,nivel3.DESCRICAO as N3_DESCRICAO
                                            ,nivel3.PERC_COMISSAO as PERC_COM_N3
                                            ,case
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel3.PERC_COMISSAO*PP.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.50)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel1.PERC_COMISSAO*mg.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100)
                                            else nivel3.PERC_COMISSAO*mg.VALOR_BEM/100
                                            end as VAL_N3
                                            ,nivel4.CODIGO_REPRESENTANTE AS N4_COD
                                            ,nivel4.NUMERO_PARCELAS_MAXIMO as N4_MAXIMO
                                            ,nivel4.DESCRICAO as N4_DESCRICAO
                                            ,nivel4.PERC_COMISSAO as PERC_COM_N4
                                            ,case
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel4.PERC_COMISSAO*PP.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.50)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel1.PERC_COMISSAO*mg.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100)
                                            else nivel4.PERC_COMISSAO*mg.VALOR_BEM/100
                                            end as VAL_N4
                                            ,ct.CODIGO_REPRESENTANTE
                                            ,ct.DATA_VENDA
                                            ,pp.VALOR_BEM as VAL_BEM_VEND
                                            ,pp.VALOR_BEM*-1 as VAL_BEM_VEND
                                            ,TOTAL_VENDAS.total as TOTAL_VENDAS_MES
                                            ,mg.CODIGO_MOVIMENTO
                                        from 
                                            COTAS ct inner join MOVIMENTOS_GRUPOS mg on
                                            ct.CODIGO_GRUPO = mg.CODIGO_GRUPO
                                            and ct.CODIGO_COTA = mg.CODIGO_COTA
                                            and ct.VERSAO = mg.VERSAO
                                            inner join REPRESENTANTES rp on
                                            rp.CODIGO_REPRESENTANTE = ct.CODIGO_REPRESENTANTE
                                            inner join CATEGORIAS_REPRESENTANTES ctr on
                                            case 
                                                when rp.CODIGO_CATEGORIA is null 
                                                then rp.CODIGO_CATEGORIA_SUPERVISAO
                                                else rp.CODIGO_CATEGORIA
                                                end = ctr.CODIGO_CATEGORIA
                                            inner join PROPOSTAS pp on
                                            pp.NUMERO_CONTRATO = ct.NUMERO_CONTRATO
                                            inner join PERIODOS_COMISSOES pc on
                                            pc.CODIGO_PERIODO = rp.CODIGO_PERIODO or mg.DATA_CONTABILIZACAO between pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL
                                            outer apply(
                                            select
                                            TOP 1 (pc.DATA_CONTABILIZACAO_INICIAL) AS DATA_INICIAL_VENDA
                                            from
                                            PERIODOS_COMISSOES pc
                                            where
                                            CODIGO_PERIODO = ${periodo}
                                            and DATA_CONTABILIZACAO_INICIAL <= ct.DATA_VENDA
                                            ORDER BY PC.DATA_CONTABILIZACAO_INICIAL DESC
                                            ) PC_DT1
                                            outer apply(
                                            select
                                            TOP 1 (pc.DATA_CONTABILIZACAO_FINAL) AS DATA_FINAL_VENDA
                                            from
                                            PERIODOS_COMISSOES pc
                                            where
                                            CODIGO_PERIODO = ${periodo}
                                            and DATA_CONTABILIZACAO_FINAL >= ct.DATA_VENDA
                                            ORDER BY PC.DATA_CONTABILIZACAO_INICIAL
                                            ) PC_DT2
                                            outer apply
                                                    (
                                                        select 
                                                        SUM(pp.VALOR_BEM) as total 
                                                        from 
                                                        PROPOSTAS pp 
                                                        where 
                                                        pp.DATA_VENDA between PC_DT1.DATA_INICIAL_VENDA and PC_DT2.DATA_FINAL_VENDA
                                                        and pp.CODIGO_REPRESENTANTE = ct.CODIGO_REPRESENTANTE
                                                    ) as TOTAL_VENDAS
                                            outer apply
                                                    (select top 1 pce.PERCENTUAL_NORMAL from COBRANCAS_ESPECIAIS ce inner join PERC_COBRANCAS_ESPECIAIS pce 
                                                        on ce.CODIGO_COBRANCA_ESPECIAL = pce.CODIGO_COBRANCA_ESPECIAL
                                                        where ce.CODIGO_GRUPO = ct.CODIGO_GRUPO and ce.CODIGO_COTA = ct.CODIGO_COTA and ce.VERSAO = ct.VERSAO
                                                        order by ce.PARCELA desc
                                                    ) as Perc_reduz       
                                            outer apply
                                            (select
                                            case 
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_1  THEN cc.PERC_1
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_2  THEN cc.PERC_2
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_3  THEN cc.PERC_3
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_4  THEN cc.PERC_4
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_5  THEN cc.PERC_5
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_6  THEN cc.PERC_6
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_7  THEN cc.PERC_7
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_8  THEN cc.PERC_8
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_9  THEN cc.PERC_9
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_10  THEN cc.PERC_10
                                            END AS PERC_COMISSAO  
                                            ,cc.NUMERO_PARCELA
                                            ,cc.PERC_1
                                            ,ctr.DESCRICAO
                                            ,rp.CODIGO_REPRESENTANTE
                                            ,rp.CODIGO_ENCARREGADO
                                            ,rp.CODIGO_EQUIPE
                                            ,QPC.NUMERO_PARCELAS_MAXIMO
                                            from 
                                            COMISSOES_CATEGORIAS cc
                                            outer apply
                                            (select 
                                                max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO 
                                                from COMISSOES_CATEGORIAS 
                                                where 
                                                    NUMERO_PARCELA < 500 
                                                    AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                                    and case when RP.CODIGO_CATEGORIA IS NULL THEN RP.CODIGO_CATEGORIA_SUPERVISAO ELSE RP.CODIGO_CATEGORIA END = CODIGO_CATEGORIA
                                                ) as QPC
                                            where 
                                            cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                            and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
                                            and case when RP.CODIGO_CATEGORIA IS NULL THEN RP.CODIGO_CATEGORIA_SUPERVISAO ELSE RP.CODIGO_CATEGORIA END = CC.CODIGO_CATEGORIA
                                            ) as nivel1
                                            outer apply
                                            (select rp2.CODIGO_REPRESENTANTE, rp2.CODIGO_ENCARREGADO, rp2.CODIGO_CATEGORIA, rp2.CODIGO_CATEGORIA_SUPERVISAO, rp2.CODIGO_EQUIPE from REPRESENTANTES rp2 where rp2.CODIGO_REPRESENTANTE = rp.CODIGO_ENCARREGADO) as rep2
                                            outer apply
                                            (select
                                            case 
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_1  THEN cc.PERC_1
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_2  THEN cc.PERC_2
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_3  THEN cc.PERC_3
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_4  THEN cc.PERC_4
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_5  THEN cc.PERC_5
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_6  THEN cc.PERC_6
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_7  THEN cc.PERC_7
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_8  THEN cc.PERC_8
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_9  THEN cc.PERC_9
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_10  THEN cc.PERC_10
                                            END AS PERC_COMISSAO 
                                            ,cc.NUMERO_PARCELA
                                            ,cc.PERC_1
                                            ,rep2.CODIGO_CATEGORIA_SUPERVISAO
                                            ,rep2.CODIGO_REPRESENTANTE
                                            ,rep2.CODIGO_ENCARREGADO
                                            ,rep2.CODIGO_EQUIPE
                                            ,cr.DESCRICAO
                                            ,QPC.NUMERO_PARCELAS_MAXIMO 
                                            from 
                                            COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
                                            cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
                                            outer apply
                                            (select 
                                                max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO 
                                                from COMISSOES_CATEGORIAS 
                                                where 
                                                    NUMERO_PARCELA < 500 
                                                    AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                                    and case when rep2.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep2.CODIGO_CATEGORIA ELSE rep2.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
                                                ) as QPC
                                            where 
                                            cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                            and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
                                            and case when rep2.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep2.CODIGO_CATEGORIA ELSE rep2.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
                                            ) as nivel2
                                            outer apply
                                            (select rp3.CODIGO_REPRESENTANTE, rp3.CODIGO_ENCARREGADO, rp3.CODIGO_CATEGORIA, rp3.CODIGO_CATEGORIA_SUPERVISAO, rp3.CODIGO_EQUIPE from REPRESENTANTES rp3 where rp3.CODIGO_REPRESENTANTE = rep2.CODIGO_ENCARREGADO) as rep3
                                            outer apply
                                            (select 
                                            cc.NUMERO_PARCELA
                                            ,case 
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_1  THEN cc.PERC_1
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_2  THEN cc.PERC_2
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_3  THEN cc.PERC_3
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_4  THEN cc.PERC_4
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_5  THEN cc.PERC_5
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_6  THEN cc.PERC_6
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_7  THEN cc.PERC_7
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_8  THEN cc.PERC_8
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_9  THEN cc.PERC_9
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_10  THEN cc.PERC_10
                                            END AS PERC_COMISSAO 
                                            ,cc.PERC_1
                                            ,rep3.CODIGO_CATEGORIA_SUPERVISAO
                                            ,rep3.CODIGO_REPRESENTANTE
                                            ,rep3.CODIGO_ENCARREGADO
                                            ,rep3.codigo_equipe
                                            ,cr.DESCRICAO
                                            ,qpc.NUMERO_PARCELAS_MAXIMO
                                            from 
                                            COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
                                            cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
                                            outer apply
                                            (select 
                                                max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO 
                                                from COMISSOES_CATEGORIAS 
                                                where 
                                                    NUMERO_PARCELA < 500 
                                                    AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                                    and case when rep3.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep3.CODIGO_CATEGORIA ELSE Rep3.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
                                                ) as QPC
                                            where 
                                            cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                            and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
                                            and case when rep3.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep3.CODIGO_CATEGORIA ELSE Rep3.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
                                            ) as nivel3
                                            outer apply
                                            (select rp4.CODIGO_REPRESENTANTE, rp4.CODIGO_ENCARREGADO, rp4.CODIGO_CATEGORIA, rp4.CODIGO_CATEGORIA_SUPERVISAO, rp4.CODIGO_EQUIPE from REPRESENTANTES rp4 where rp4.CODIGO_REPRESENTANTE = rep3.CODIGO_ENCARREGADO) as rep4
                                            outer apply
                                            (select 
                                            case 
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_1  THEN cc.PERC_1
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_2  THEN cc.PERC_2
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_3  THEN cc.PERC_3
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_4  THEN cc.PERC_4
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_5  THEN cc.PERC_5
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_6  THEN cc.PERC_6
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_7  THEN cc.PERC_7
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_8  THEN cc.PERC_8
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_9  THEN cc.PERC_9
                                                WHEN TOTAL_VENDAS.total <= cc.FAIXA_10  THEN cc.PERC_10
                                            END AS PERC_COMISSAO 
                                            ,cc.NUMERO_PARCELA
                                            ,cc.PERC_1
                                            ,rep4.CODIGO_CATEGORIA_SUPERVISAO
                                            ,rep4.CODIGO_REPRESENTANTE
                                            ,rep4.CODIGO_ENCARREGADO
                                            ,rep4.CODIGO_EQUIPE
                                            ,cr.DESCRICAO
                                            ,qpc.NUMERO_PARCELAS_MAXIMO 
                                            from 
                                            COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
                                            cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
                                            outer apply
                                            (select 
                                                max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO 
                                                from COMISSOES_CATEGORIAS 
                                                where 
                                                    NUMERO_PARCELA < 500 
                                                    AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                                    and case when rep4.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep4.CODIGO_CATEGORIA ELSE Rep4.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
                                                ) as QPC
                                            where 
                                            cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                            and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
                                            and case when rep4.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep4.CODIGO_CATEGORIA ELSE Rep4.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
                                            ) as nivel4
                                            outer apply
                                            (select max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO from COMISSOES_CATEGORIAS where NUMERO_PARCELA < 500 AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO) as QUANTIDADE_PARCELAS

                                        where
                                            --ct.CODIGO_GRUPO = '056'
                                            --and ct.CODIGO_COTA = '028'
                                            --and ct.VERSAO = '00'
                                            mg.CODIGO_MOVIMENTO in ('010','011')` +
      complemento +
      ` and ct.VERSAO < '40'
                                            and mg.DATA_CONTABILIZACAO between '${data_inicial}' and '${data_final}'
                                            and ct.DATA_VENDA between pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL
                                            and (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) <= QUANTIDADE_PARCELAS.NUMERO_PARCELAS_MAXIMO
                                        order by
                                            ct.CODIGO_GRUPO
                                            ,ct.CODIGO_COTA
                                            ,ct.VERSAO`
  );

  var result2;

  if (opcao == 1) {
    result2 = await this._connection(`
         select 
           rp.CODIGO_REPRESENTANTE, 
           rp.NOME, 
           rp.CODIGO_CATEGORIA,
           cr.DESCRICAO AS DESCRICAO_CATEGORIA,
           rp.CODIGO_CATEGORIA_SUPERVISAO, 
           cs.DESCRICAO AS DESCRICAO_SUPERVISAO,
           rp.CODIGO_ENCARREGADO,
           RC.NOME AS NOME_ENCARREGADO
         from 
           REPRESENTANTES rp
           outer apply(
           select 
           * 
           from 
           CATEGORIAS_REPRESENTANTES cr
           where
           cr.CODIGO_CATEGORIA = rp.CODIGO_CATEGORIA ) as cr
           outer apply(
           select 
           * 
           from 
           CATEGORIAS_REPRESENTANTES cr
           where
           cr.CODIGO_CATEGORIA = rp.CODIGO_CATEGORIA_SUPERVISAO ) as cs
           outer apply(
             select
             NOME
             from
             REPRESENTANTES rpp
             where
             rpp.CODIGO_REPRESENTANTE = rp.CODIGO_ENCARREGADO) as rc
           where 
             rp.CODIGO_REPRESENTANTE = ${codigo}`);
  } else {
    result2 = await this._connection(`
           select
           eq.CODIGO_EQUIPE
           ,eq.DESCRICAO
           from
           EQUIPES_VENDAS eq
           where
           eq.CODIGO_EQUIPE = ${codigo}`);
  }

  var result = result1.concat(result2);
  return result;
};

ConsultasDAO.prototype.getQuitados = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;

  var result = await this._connection(`select ct.CODIGO_GRUPO as 'Grupo',
                                                ct.CODIGO_COTA as 'Cota',
                                                ct.VERSAO as 'Versão',
                                                format (ct.DATA_SITUACAO,'dd/MM/yyyy', 'en-US') as 'Data da quitação',
                                                Cl.DDD_RESIDENCIAL as 'DDD',
                                                Cl.fone_fax as 'Telefone',
                                                cl.CELULAR as 'Celular',
                                                tc.DDD as 'DDD Tab.',
                                                tc.FONE_FAX as 'Telefone tab.',
                                                cl.NOME as 'Nome',
                                                cl.E_MAIL as 'E-mail'
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
                                            where ct.CODIGO_SITUACAO = 'Q00'
                                            and ct.DATA_SITUACAO between '${data_inicial}' and '${data_final}'
                                            and a.QTD_SIT is null`);
  return result;
};

ConsultasDAO.prototype.getAniversariantesMes = async function (req) {
  let mes_nascimento = req.query.mes_nascimento;

  var result = await this._connection(`select 
                                                ct.CODIGO_GRUPO as 'GRUPO',
                                                ct.CODIGO_COTA as 'COTA',
                                                ct.VERSAO as 'VERSÃO',
                                                sc.DESCRICAO as 'SITUAÇÃO', 
                                                NOME,
                                                ct.NUMERO_CONTRATO as 'CONTRATO',
                                                E_MAIL as 'E-MAIL',
                                                format (cl.DATA_NASCIMENTO,'dd/MM/yyyy', 'en-US') as 'DATA DE NASCIMENTO'
                                            from clientes cl inner join COTAS ct on cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
                                            inner join SITUACOES_COBRANCAS sc on sc.codigo_situacao = ct.CODIGO_SITUACAO
                                            inner join GRUPOS g on ct.CODIGO_GRUPO = g.CODIGO_GRUPO
                                            where month(data_nascimento) = ${mes_nascimento} and g.CODIGO_SITUACAO = 'A' and ct.VERSAO = 00 and PESSOA = 'F' and sc.CODIGO_SITUACAO like 'N%%'
                                            order by ct.CODIGO_GRUPO,ct.CODIGO_COTA`);
  return result;
};

ConsultasDAO.prototype.getRelatorioRenegociacoes = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;

  let result = await this._connection(`select
                                            ct.CODIGO_GRUPO as GRUPO
                                            ,ct.CODIGO_COTA AS COTA
                                            ,ct.VERSAO AS VERSAO
                                            ,cl.NOME AS NOME_CLIENTE
                                            ,RP.NOME AS NOME_REPRESENTANTE
                                            ,cd.nome as CIDADE
                                            ,CD.ESTADO AS ESTADO
                                            ,(isnull(PAG.VALOR_FC,0)+isnull(PAG2.VALOR_FC,0)+isnull(PAG3.VALOR_FC,0)) AS VALOR_FC
                                            ,(isnull(PAG.VALOR_TX,0)+isnull(pag2.VALOR_TX,0)+isnull(pag3.VALOR_TX,0)) AS VALOR_TX
                                            ,(isnull(PAG.VALOR_TOTAL,0)+isnull(pag2.VALOR_TOTAL,0)+ISNULL(PAG3.VALOR_TOTAL,0)) AS VALOR_TOTAL
                                            ,QTD_PAG.QTD_PAG AS QUANTIDADE_PAG
                                            ,format (ct.DATA_REATIVACAO,'dd/MM/yyyy', 'en-US') as 'DATA REATIVAÇÃO'
                                            ,NEG.STATUS
                                            ,format (neg.DATA_ALTERACAO,'dd/MM/yyyy', 'en-US') as 'DATA NEGOCIAÇÃO'
                                            ,NEG.PARCELAS AS PARCELAS_NEGOCIADAS

                                        from
                                            cotas ct inner join clientes cl on
                                                ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE
                                                and ct.tipo = cl.tipo
                                            INNER join representantes rp on
                                                ct.CODIGO_REPRESENTANTE = rp.CODIGO_REPRESENTANTE
                                            INNER join CIDADES cd on
                                                cd.CODIGO_CIDADE = cl.CODIGO_CIDADE
                                            OUTER APPLY (
                                                SELECT 
                                                    sum(mg.VALOR_FUNDO_COMUM) AS VALOR_FC, sum(mg.VALOR_TAXA_ADMINISTRACAO) AS VALOR_TX,sum(MG.TOTAL_LANCAMENTO) AS VALOR_TOTAL
                                                FROM 
                                                    MOVIMENTOS_GRUPOS MG
                                                WHERE
                                                    MG.CODIGO_GRUPO = CT.CODIGO_GRUPO
                                                    AND MG.CODIGO_COTA = CT.CODIGO_COTA
                                                    AND MG.VERSAO = CT.VERSAO
                                                    AND DATA_PAGAMENTO BETWEEN '${data_inicial}' AND '${data_final}'
                                                    AND DATEDIFF(DAY,MG.DATA_VENCIMENTO,MG.DATA_PAGAMENTO)+1 > 10

                                            ) AS PAG
                                            OUTER APPLY (
                                                SELECT 
                                                    COUNT(MG.CODIGO_COTA) AS QTD_PAG
                                                FROM 
                                                    MOVIMENTOS_GRUPOS MG
                                                WHERE
                                                    MG.CODIGO_GRUPO = CT.CODIGO_GRUPO
                                                    AND MG.CODIGO_COTA = CT.CODIGO_COTA
                                                    AND MG.VERSAO = CT.VERSAO
                                                    AND DATA_PAGAMENTO BETWEEN '${data_inicial}' AND '${data_final}'
                                            ) AS QTD_PAG
                                            OUTER APPLY(
                                                select
                                                    top 1 
                                                    pt.data_alteracao, 
                                                    STATUS, 
                                                    parcelas 
                                                from 
                                                    PLANOS_TAXAS pt
                                                where 
                                                    STATUS in ('ta','rp')
                                                    AND pt.CODIGO_GRUPO = ct.CODIGO_GRUPO
                                                    and pt.CODIGO_COTA = ct.CODIGO_COTA
                                                    and pt.VERSAO = ct.VERSAO
                                                    AND PT.DATA_ALTERACAO BETWEEN '${data_inicial}' AND '${data_final}'
                                                order by
                                                    pt.DATA_ALTERACAO
                                                desc
                                                ) as Neg
                                            OUTER APPLY (
                                                SELECT 
                                                    sum(mg.VALOR_FUNDO_COMUM) AS VALOR_FC, sum(mg.VALOR_TAXA_ADMINISTRACAO) AS VALOR_TX,sum(MG.TOTAL_LANCAMENTO) AS VALOR_TOTAL
                                                FROM 
                                                    MOVIMENTOS_GRUPOS MG
                                                WHERE
                                                    MG.CODIGO_GRUPO = CT.CODIGO_GRUPO
                                                    AND MG.CODIGO_COTA = CT.CODIGO_COTA
                                                    AND MG.VERSAO = CT.VERSAO
                                                    AND DATA_PAGAMENTO BETWEEN '${data_inicial}' AND '${data_final}'
                                                    AND CODIGO_MOVIMENTO = '010'
                                                    AND PAG.VALOR_TOTAL > 0
                                                    AND DATEDIFF(DAY,MG.DATA_VENCIMENTO,MG.DATA_PAGAMENTO)+1 <= 10
                                                ) AS PAG2
                                            OUTER APPLY (
                                                SELECT 
                                                    sum(mg.VALOR_FUNDO_COMUM) AS VALOR_FC, sum(mg.VALOR_TAXA_ADMINISTRACAO) AS VALOR_TX,sum(MG.TOTAL_LANCAMENTO) AS VALOR_TOTAL
                                                FROM 
                                                    MOVIMENTOS_GRUPOS MG
                                                WHERE
                                                    MG.CODIGO_GRUPO = CT.CODIGO_GRUPO
                                                    AND MG.CODIGO_COTA = CT.CODIGO_COTA
                                                    AND MG.VERSAO = CT.VERSAO
                                                    AND DATA_PAGAMENTO BETWEEN '${data_inicial}' AND '${data_final}'
                                                    AND CODIGO_MOVIMENTO = '010'
                                                    AND neg.STATUS in ('ta','rp')
                                                    and pag.VALOR_FC IS NULL
                                                    AND NEG.DATA_ALTERACAO > MG.DATA_PAGAMENTO
                                                ) AS PAG3
                                        where
                                            ct.DATA_CONTEMPLACAO is null
                                            AND (isnull(PAG.VALOR_FC,0)+isnull(PAG2.VALOR_FC,0)+isnull(PAG3.VALOR_FC,0)) > 0
                                        order by
                                            ct.CODIGO_GRUPO
                                            ,ct.CODIGO_COTA
                                            ,ct.VERSAO`);
  return result;
};

ConsultasDAO.prototype.getRelatorioAproveitamento = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let equipe_inicial = req.query.equipe_inicial;
  let equipe_final = req.query.equipe_final;

  var result1 = await this._connection(`select CODIGO_GRUPO as GRUPO,
                                            CODIGO_COTA AS COTA,
                                            VERSAO AS 'VERSÃO',
                                            CT.CODIGO_SITUACAO as 'SITUAÇÃO',
                                            FORMAT(CT.DATA_VENDA, 'dd/MM/yyyy', 'en-US') as 'DATA DA VENDA',
                                            CT.CODIGO_REPRESENTANTE AS 'COD. REP',
                                            rep.NOME 
                                        from COTAS ct 
                                        inner join REPRESENTANTES rep 
                                        on ct.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
                                        where ct.DATA_VENDA BETWEEN '${data_inicial}' AND '${data_final}' and rep.codigo_equipe between '${equipe_inicial}' AND '${equipe_final}'
                                        order by rep.CODIGO_REPRESENTANTE `);

  var result2 = await this
    ._connection(`SELECT rep.CODIGO_REPRESENTANTE AS 'REPRESENTANTE',
                                            CT.CODIGO_SITUACAO as 'SITUAÇÃO',
                                            COUNT(CODIGO_SITUACAO) AS QUANTIDADE,
                                            sum(pp.VALOR_BEM) as 'TOTAL VALOR'
                                        from COTAS ct 
                                        inner join REPRESENTANTES rep 
                                        on ct.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
                                        inner join PROPOSTAS pp
                                        on ct.CODIGO_GRUPO = pp.CODIGO_GRUPO and ct.CODIGO_COTA = pp.CODIGO_COTA and ct.VERSAO = pp.VERSAO
                                        where ct.DATA_VENDA BETWEEN '${data_inicial}' AND '${data_final}' and rep.codigo_equipe between '${equipe_inicial}' AND '${equipe_final}'
                                        GROUP BY ct.CODIGO_SITUACAO, rep.CODIGO_REPRESENTANTE
                                        order by rep.CODIGO_REPRESENTANTE`);
  var result = result1.concat(result2);
  return result;
};

module.exports = function () {
  return ConsultasDAO;
};
