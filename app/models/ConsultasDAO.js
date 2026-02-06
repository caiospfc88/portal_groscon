const { geraFiltroSql } = require("../utils/geraFiltroSql");
const { geraPlanilhaBradesco, geraPlanilha } = require("../utils/geraPlanilha");

function ConsultasDAO(connection) {
  this._connection = connection;
}

ConsultasDAO.prototype.getComissoesSemReducao = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let periodo = req.query.periodo;
  let opcao = req.query.opcao;
  let codigo = req.query.codigo;

  let complemento = "";
  if (opcao == 2) {
    complemento = `and ((nivel1.CODIGO_EQUIPE = ${codigo}) or (nivel2.CODIGO_EQUIPE = ${codigo}) or (nivel3.CODIGO_EQUIPE = ${codigo}) or (nivel4.CODIGO_EQUIPE = ${codigo}))`;
  } else {
    complemento = `and ((nivel1.CODIGO_REPRESENTANTE = ${codigo}) or (nivel2.CODIGO_REPRESENTANTE = ${codigo}) or (nivel3.CODIGO_REPRESENTANTE = ${codigo}) or (nivel4.CODIGO_REPRESENTANTE = ${codigo}))`;
  }
  let dados = await this._connection(
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
    and mg.AVISO_ESTORNO = 0
  order by
    ct.CODIGO_GRUPO
    ,ct.CODIGO_COTA
    ,ct.VERSAO`,
  );

  let dadosRepresentante;
  let dadosEquipe;

  if (opcao == 1) {
    dadosRepresentante = await this._connection(`
         select 
           rp.CODIGO_REPRESENTANTE, 
           rp.NOME, 
           isnull(rp.CODIGO_CATEGORIA,0) as CODIGO_CATEGORIA,
           isnull(cr.DESCRICAO,'------') AS DESCRICAO_CATEGORIA,
           isnull(rp.CODIGO_CATEGORIA_SUPERVISAO,0) as CODIGO_CATEGORIA_SUPERVISAO,
           ISNULL(cs.DESCRICAO,'------') AS DESCRICAO_SUPERVISAO,
           ISNULL(rp.CODIGO_ENCARREGADO,0) AS CODIGO_ENCARREGADO,
           ISNULL(RC.NOME,'------') AS NOME_ENCARREGADO
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
    dadosEquipe = await this._connection(`
           select
           eq.CODIGO_EQUIPE
           ,eq.DESCRICAO
           from
           EQUIPES_VENDAS eq
           where
           eq.CODIGO_EQUIPE = ${codigo}`);
  }

  let dataPeriodo =
    data_inicial.substring(6, 8) +
    "/" +
    data_inicial.substring(4, 6) +
    "/" +
    data_inicial.substring(0, 4) +
    " até " +
    data_final.substring(6, 8) +
    "/" +
    data_final.substring(4, 6) +
    "/" +
    data_final.substring(0, 4);

  var result = [
    dados,
    dadosRepresentante ? dadosRepresentante : dadosEquipe,
    dataPeriodo,
  ];
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
  var dados = await this._connection(
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
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel2.PERC_COMISSAO*mg.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100)
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
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel3.PERC_COMISSAO*mg.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel3.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel3.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel3.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel3.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel3.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100)
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
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN nivel4.PERC_COMISSAO*mg.VALOR_BEM/100
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN nivel4.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN nivel4.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN nivel4.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN nivel4.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100)
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN nivel4.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100)
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
                                            and mg.AVISO_ESTORNO = 0
                                        order by
                                            ct.CODIGO_GRUPO
                                            ,ct.CODIGO_COTA
                                            ,ct.VERSAO`,
  );

  let dadosRepresentante;
  let dadosEquipe;

  if (opcao == 1) {
    dadosRepresentante = await this._connection(`
         select 
           rp.CODIGO_REPRESENTANTE, 
           rp.NOME, 
           isnull(rp.CODIGO_CATEGORIA,0) as CODIGO_CATEGORIA,
           isnull(cr.DESCRICAO,'------') AS DESCRICAO_CATEGORIA,
           isnull(rp.CODIGO_CATEGORIA_SUPERVISAO,0) as CODIGO_CATEGORIA_SUPERVISAO,
           ISNULL(cs.DESCRICAO,'------') AS DESCRICAO_SUPERVISAO,
           ISNULL(rp.CODIGO_ENCARREGADO,0) AS CODIGO_ENCARREGADO,
           ISNULL(RC.NOME,'------') AS NOME_ENCARREGADO
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
    dadosEquipe = await this._connection(`
           select
           eq.CODIGO_EQUIPE
           ,eq.DESCRICAO
           from
           EQUIPES_VENDAS eq
           where
           eq.CODIGO_EQUIPE = ${codigo}`);
  }

  let dataPeriodo =
    data_inicial.substring(6, 8) +
    "/" +
    data_inicial.substring(4, 6) +
    "/" +
    data_inicial.substring(0, 4) +
    " até " +
    data_final.substring(6, 8) +
    "/" +
    data_final.substring(4, 6) +
    "/" +
    data_final.substring(0, 4);

  var result = [
    dados,
    dadosRepresentante ? dadosRepresentante : dadosEquipe,
    dataPeriodo,
  ];
  return result;
};

ConsultasDAO.prototype.getQuitados = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;

  let result = await this._connection(`select ct.CODIGO_GRUPO as 'Grupo',
       ct.CODIGO_COTA as 'Cota',
	   ct.VERSAO as 'Versão',
	   format (ct.DATA_SITUACAO,'dd/MM/yyyy', 'en-US') as 'Data da quitação',
	   cid.nome as Cidade,
	   cid.ESTADO as Estado,
	   Cl.DDD_RESIDENCIAL as 'DDD',
	   Cl.fone_fax as 'Telefone',
	   cl.CELULAR as 'Celular',
	   tc.DDD as 'DDD Tab.',
	   tc.FONE_FAX as 'Telefone tab.',
	   cl.NOME as 'Nome',
	   format(rb.PRECO_TABELA, 'C', 'pt-br') as 'Valor Crédito',
	   cl.E_MAIL as 'E-mail',
	   (ct.CODIGO_REPRESENTANTE + ' - ' +  rep.NOME) as Vendedor
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

ConsultasDAO.prototype.comissoesPagasAnalitico = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;

  let result = await this._connection(`select 
case 
	when COMISSAO_BONIFICACAO = 'C' then 'Comissão Paga'
	else COMISSAO_BONIFICACAO
end as 'Tipo',
ct.ID_COTA as ID_Cota,
'ID_Empresa' = 1,
cp.CODIGO_GRUPO as CD_Grupo,
cp.CODIGO_COTA as CD_Cota,
cp.VERSAO,
( rep.NOME + ' - ' + cp.CODIGO_REPRESENTANTE)  as Represent,
format(cp.DATA_FINAL,'dd/MM/yyyy','en-US') as 'DT_Evento',
cp.PARCELA_LIBERACAO as Parcela,
cp.VALOR_COMISSAO_BONIFICACAO as Valor
from COMISSOES_PAGAS cp
inner join cotas ct
on ct.codigo_grupo = cp.CODIGO_GRUPO and ct.CODIGO_COTA = cp.CODIGO_COTA and ct.VERSAO = cp.VERSAO
left join REPRESENTANTES rep
on cp.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
where DATA_FInal between '${data_inicial}' and '${data_final}' --and CODIGO_REPRESENTANTE in (2377) and CODIGO_COTA = 10
order by cp.CODIGO_REPRESENTANTE`);
  return result;
};

ConsultasDAO.prototype.comissoesPagasSintetico = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;

  let result = await this._connection(`SELECT
    
    (rep.NOME + ' - ' + cp.CODIGO_REPRESENTANTE) AS Represent,
    SUM(cp.VALOR_COMISSAO_BONIFICACAO) AS 'Valor Por Representante'
    
FROM
    COMISSOES_PAGAS cp
LEFT JOIN
    REPRESENTANTES rep ON cp.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
WHERE
    cp.DATA_FINAL BETWEEN '${data_inicial}' and '${data_final}'
    -- AND cp.CODIGO_REPRESENTANTE IN (2377) AND cp.CODIGO_COTA = 10 -- Linha comentada do seu exemplo
GROUP BY
    (rep.NOME + ' - ' + cp.CODIGO_REPRESENTANTE)
ORDER BY
    Represent;`);
  return result;
};

ConsultasDAO.prototype.ComissaoExtraManual = async function (req) {
  const parcela = req.query.parcela ? Number(req.query.parcela) : null;
  const grupo = req.query.grupo ?? null;
  const cota = req.query.cota ?? null;
  const versao = req.query.versao ?? null;
  const dataPag = req.query.data_pag_comissao ?? null; // string 'yyyymmdd' ou null
  const valor = req.query.valor
    ? Number(String(req.query.valor).replace(",", "."))
    : 0;
  const representante = req.query.representante;

  let result = await this._connection(`select 
0 as ID_Sequencia,
1 as ID_Empresa,
(concat(ct.codigo_grupo,' - ',ct.CODIGO_COTA,' / ',ct.VERSAO)) as Cota,
FORMAT(ValorBem.PRECO_TABELA, 'N2', 'pt-BR') AS Bem,
ct.ID_COTA as ID_Cota,
${parcela} as Parcela,
RIGHT(REPLICATE('0', 6) + CAST(${representante} AS VARCHAR(6)), 6) AS Represent,
0 as Categoria,
0 as Período,
CONVERT(CHAR(8), ${dataPag}, 112) AS Data_Com,
CONVERT(CHAR(8), ${dataPag}, 112) AS DT_Geracao,
REPLACE(LTRIM(STR(CAST(${valor} AS DECIMAL(18,2))
    ,18,2)),'.',',') AS Valor,
'N' as SN_Bonus,
'J' as Tipo_Favorecido,
'Inserido Manualmente ou por importação' as Calculo
from cotas ct
OUTER APPLY (
    SELECT TOP 1 preco_tabela 
    FROM REAJUSTES_BENS rb
    WHERE ct.codigo_bem = rb.CODIGO_BEM 
    ORDER BY DATA_REAJUSTE DESC
) as ValorBem
where ct.CODIGO_GRUPO = ${grupo} and ct.CODIGO_COTA = ${cota} and ct.VERSAO = ${versao}`);

  return result;
};

ConsultasDAO.prototype.rateioComissaoFixa = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let data_pag_comissao = req.query.data_pag_comissao;
  let valorFixo = req.query.valorFixo;
  let representante = req.query.representante;

  let result = await this._connection(`;WITH base AS
(
    select distinct
         0 as ID_Sequencia,
         1 as ID_Empresa,
         ct.ID_COTA as ID_Cota,
		 (concat(ct.codigo_grupo,' - ',ct.CODIGO_COTA,' / ',ct.VERSAO)) as Cota,
         (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) as Parcela,
         RIGHT('000000' + CAST(${representante} AS VARCHAR(6)), 6) AS Represent,
         0 as Categoria,
         0 as 'Período',
         '${data_pag_comissao}' as Data_Com,
         '${data_pag_comissao}' as DT_Geracao,
         mg.VALOR_BEM AS VL_BEM,
		 'N' as SN_Bonus,
		 'J' as Tipo_Favorecido
    from COTAS ct
    inner join MOVIMENTOS_GRUPOS mg
        on ct.CODIGO_GRUPO = mg.CODIGO_GRUPO
        and ct.CODIGO_COTA = mg.CODIGO_COTA
        and ct.VERSAO = mg.VERSAO
    inner join REPRESENTANTES rp
        on rp.CODIGO_REPRESENTANTE = ct.CODIGO_REPRESENTANTE
    inner join CATEGORIAS_REPRESENTANTES ctr
        on case when rp.CODIGO_CATEGORIA is null then rp.CODIGO_CATEGORIA_SUPERVISAO else rp.CODIGO_CATEGORIA end = ctr.CODIGO_CATEGORIA
    inner join PROPOSTAS pp
        on pp.NUMERO_CONTRATO = ct.NUMERO_CONTRATO
    inner join PERIODOS_COMISSOES pc
        on pc.CODIGO_PERIODO = rp.CODIGO_PERIODO or mg.DATA_CONTABILIZACAO between pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL

    /* OUTER APPLYs que precisamos declarar antes do WHERE */
    outer apply(
        select TOP 1 pc.DATA_CONTABILIZACAO_INICIAL AS DATA_INICIAL_VENDA
        from PERIODOS_COMISSOES pc
        where CODIGO_PERIODO = 1
          and DATA_CONTABILIZACAO_INICIAL <= ct.DATA_VENDA
        ORDER BY pc.DATA_CONTABILIZACAO_INICIAL DESC
    ) PC_DT1

    outer apply(
        select TOP 1 pc.DATA_CONTABILIZACAO_FINAL AS DATA_FINAL_VENDA
        from PERIODOS_COMISSOES pc
        where CODIGO_PERIODO = 1
          and DATA_CONTABILIZACAO_FINAL >= ct.DATA_VENDA
        ORDER BY pc.DATA_CONTABILIZACAO_INICIAL
    ) PC_DT2

    outer apply
    (
        select SUM(pp2.VALOR_BEM) as total
        from PROPOSTAS pp2
        where pp2.DATA_VENDA between PC_DT1.DATA_INICIAL_VENDA and PC_DT2.DATA_FINAL_VENDA
          and pp2.CODIGO_REPRESENTANTE = ct.CODIGO_REPRESENTANTE
    ) as TOTAL_VENDAS

    outer apply
    (
        select top 1 pce.PERCENTUAL_NORMAL
        from COBRANCAS_ESPECIAIS ce
        inner join PERC_COBRANCAS_ESPECIAIS pce
            on ce.CODIGO_COBRANCA_ESPECIAL = pce.CODIGO_COBRANCA_ESPECIAL
        where ce.CODIGO_GRUPO = ct.CODIGO_GRUPO
          and ce.CODIGO_COTA = ct.CODIGO_COTA
          and ce.VERSAO = ct.VERSAO
        order by ce.PARCELA desc
    ) as Perc_reduz

    /* nivel1 */
    outer apply
    (
        select
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
             WHEN TOTAL_VENDAS.total <= cc.FAIXA_10 THEN cc.PERC_10
           END AS PERC_COMISSAO,
           cc.NUMERO_PARCELA,
           cc.PERC_1,
           ctr.DESCRICAO,
           rp.CODIGO_REPRESENTANTE,
           rp.CODIGO_ENCARREGADO,
           rp.CODIGO_EQUIPE,
           QPC.NUMERO_PARCELAS_MAXIMO
        from COMISSOES_CATEGORIAS cc
        outer apply
        (
            select max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO
            from COMISSOES_CATEGORIAS
            where NUMERO_PARCELA < 500
              AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
              and case when rp.CODIGO_CATEGORIA IS NULL THEN rp.CODIGO_CATEGORIA_SUPERVISAO ELSE rp.CODIGO_CATEGORIA END = CODIGO_CATEGORIA
        ) as QPC
        where cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
          and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
          and case when rp.CODIGO_CATEGORIA IS NULL THEN rp.CODIGO_CATEGORIA_SUPERVISAO ELSE rp.CODIGO_CATEGORIA END = CC.CODIGO_CATEGORIA
    ) as nivel1

    /* rep2 (usa rp.CODIGO_ENCARREGADO) */
    outer apply
    (
        select rp2.CODIGO_REPRESENTANTE, rp2.CODIGO_ENCARREGADO, rp2.CODIGO_CATEGORIA, rp2.CODIGO_CATEGORIA_SUPERVISAO, rp2.CODIGO_EQUIPE
        from REPRESENTANTES rp2
        where rp2.CODIGO_REPRESENTANTE = rp.CODIGO_ENCARREGADO
    ) as rep2

    /* nivel2 (usa rep2) */
    outer apply
    (
        select
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
             WHEN TOTAL_VENDAS.total <= cc.FAIXA_10 THEN cc.PERC_10
           END AS PERC_COMISSAO,
           cc.NUMERO_PARCELA,
           cc.PERC_1,
           rep2.CODIGO_CATEGORIA_SUPERVISAO,
           rep2.CODIGO_REPRESENTANTE,
           rep2.CODIGO_ENCARREGADO,
           rep2.CODIGO_EQUIPE,
           cr.DESCRICAO,
           QPC.NUMERO_PARCELAS_MAXIMO
        from COMISSOES_CATEGORIAS cc
        inner join CATEGORIAS_REPRESENTANTES cr on cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
        outer apply
        (
            select max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO
            from COMISSOES_CATEGORIAS
            where NUMERO_PARCELA < 500
              AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
              and case when rep2.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep2.CODIGO_CATEGORIA ELSE rep2.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
        ) as QPC
        where cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
          and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
          and case when rep2.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep2.CODIGO_CATEGORIA ELSE rep2.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
    ) as nivel2

    /* rep3 (usa rep2.CODIGO_ENCARREGADO) */
    outer apply
    (
        select rp3.CODIGO_REPRESENTANTE, rp3.CODIGO_ENCARREGADO, rp3.CODIGO_CATEGORIA, rp3.CODIGO_CATEGORIA_SUPERVISAO, rp3.CODIGO_EQUIPE
        from REPRESENTANTES rp3
        where rp3.CODIGO_REPRESENTANTE = rep2.CODIGO_ENCARREGADO
    ) as rep3

    /* nivel3 */
    outer apply
    (
        select
           cc.NUMERO_PARCELA,
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
             WHEN TOTAL_VENDAS.total <= cc.FAIXA_10 THEN cc.PERC_10
           END AS PERC_COMISSAO,
           cc.PERC_1,
           rep3.CODIGO_CATEGORIA_SUPERVISAO,
           rep3.CODIGO_REPRESENTANTE,
           rep3.CODIGO_ENCARREGADO,
           rep3.CODIGO_EQUIPE,
           cr.DESCRICAO,
           qpc.NUMERO_PARCELAS_MAXIMO
        from COMISSOES_CATEGORIAS cc
        inner join CATEGORIAS_REPRESENTANTES cr on cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
        outer apply
        (
            select max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO
            from COMISSOES_CATEGORIAS
            where NUMERO_PARCELA < 500
              AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
              and case when rep3.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep3.CODIGO_CATEGORIA ELSE rep3.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
        ) as qpc
        where cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
          and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
          and case when rep3.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep3.CODIGO_CATEGORIA ELSE rep3.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
    ) as nivel3

    /* rep4 */
    outer apply
    (
        select rp4.CODIGO_REPRESENTANTE, rp4.CODIGO_ENCARREGADO, rp4.CODIGO_CATEGORIA, rp4.CODIGO_CATEGORIA_SUPERVISAO, rp4.CODIGO_EQUIPE
        from REPRESENTANTES rp4
        where rp4.CODIGO_REPRESENTANTE = rep3.CODIGO_ENCARREGADO
    ) as rep4

    /* nivel4 */
    outer apply
    (
        select
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
             WHEN TOTAL_VENDAS.total <= cc.FAIXA_10 THEN cc.PERC_10
           END AS PERC_COMISSAO,
           cc.NUMERO_PARCELA,
           cc.PERC_1,
           rep4.CODIGO_CATEGORIA_SUPERVISAO,
           rep4.CODIGO_REPRESENTANTE,
           rep4.CODIGO_ENCARREGADO,
           rep4.CODIGO_EQUIPE,
           cr.DESCRICAO,
           qpc.NUMERO_PARCELAS_MAXIMO
        from COMISSOES_CATEGORIAS cc
        inner join CATEGORIAS_REPRESENTANTES cr on cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
        outer apply
        (
            select max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO
            from COMISSOES_CATEGORIAS
            where NUMERO_PARCELA < 500
              AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
              and case when rep4.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep4.CODIGO_CATEGORIA ELSE rep4.CODIGO_CATEGORIA_SUPERVISAO END = CODIGO_CATEGORIA
        ) as qpc
        where cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
          and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
          and case when rep4.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep4.CODIGO_CATEGORIA ELSE rep4.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
    ) as nivel4

    /* QUANTIDADE_PARCELAS (também precisa existir antes do WHERE) */
    outer apply
    (
        select max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO
        from COMISSOES_CATEGORIAS
        where NUMERO_PARCELA < 500
          AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
    ) as QUANTIDADE_PARCELAS

    /* agora o WHERE usa os aliases já declarados */
    where
      mg.CODIGO_MOVIMENTO in ('010','011')
      and (
          (nivel1.CODIGO_REPRESENTANTE = ${representante})
       or (nivel2.CODIGO_REPRESENTANTE = ${representante})
       or (nivel3.CODIGO_REPRESENTANTE = ${representante})
       or (nivel4.CODIGO_REPRESENTANTE = ${representante})
      )
      and ct.VERSAO < '40'
      and mg.DATA_CONTABILIZACAO between '${data_inicial}' and '${data_final}'
      and ct.DATA_VENDA between pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL
      and (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) <= QUANTIDADE_PARCELAS.NUMERO_PARCELAS_MAXIMO
      and mg.AVISO_ESTORNO = 0
), calc AS
(
    SELECT
        b.*,
        SUM(b.VL_BEM) OVER() AS TOTAL_VL_BEM,
        CASE WHEN SUM(b.VL_BEM) OVER() = 0 THEN 0
             ELSE ${valorFixo} * CAST(b.VL_BEM AS DECIMAL(18,6)) / CAST(SUM(b.VL_BEM) OVER() AS DECIMAL(18,6))
        END AS ValorRaw
    FROM base b
), rounded AS
(
    SELECT
        c.ID_Sequencia,
        c.ID_Empresa,
        c.Cota,
        c.ID_Cota,
        c.Parcela,
        c.Represent,
        c.Categoria,
        c.Período,
        c.Data_Com,
        c.DT_Geracao,
        c.VL_BEM,
        ROW_NUMBER() OVER (ORDER BY c.ID_COTA) AS rn,
        COUNT(*) OVER() AS cnt,
        -- soma dos valores já arredondados (usada para o ajuste final)
        SUM(CAST(ROUND(c.ValorRaw, 2) AS DECIMAL(18,2))) OVER() AS SumRounded,
        -- valor arredondado desta linha
        CAST(ROUND(c.ValorRaw, 2) AS DECIMAL(18,2)) AS ValorRounded,
        -- total de VL_BEM (veio de c.TOTAL_VL_BEM no CTE calc)
        c.TOTAL_VL_BEM,
        -- ValorRaw bruto (antes do round) caso queira exibir
        c.ValorRaw,
        -- as colunas que você precisa no SELECT final
        c.SN_Bonus,
        c.Tipo_Favorecido
    FROM calc c
)

SELECT
    ID_Sequencia,
    ID_Empresa,
    Cota,
    FORMAT(VL_BEM, 'N2', 'pt-BR') as 'Bem',
    ID_Cota,
    Parcela,
    Represent,
    Categoria,
    Período,
    CONVERT(CHAR(8), Data_Com, 112) AS Data_Com,
    CONVERT(CHAR(8), DT_Geracao, 112) AS DT_Geracao,

    /* Valor exibido (string com vírgula) - mantém a lógica de ajuste final */
    REPLACE(LTRIM(STR(
      CAST(
        CASE
          WHEN cnt = 0 THEN CAST(0 AS DECIMAL(18,2))
          WHEN rn = cnt THEN ValorRounded + (${valorFixo} - SumRounded)
          ELSE ValorRounded
        END
      AS DECIMAL(18,2))
    ,18,2)),'.',',') AS Valor,

    SN_Bonus,
    Tipo_Favorecido,

    /* coluna com a fórmula (nomes curtos e explicação) */
    CASE
      WHEN cnt = 0 THEN 'Sem registros para cálculo'
      WHEN rn = cnt THEN
        -- última linha: mostra VF, VB, TT, fórmula, resultado, SumRounded e Ajuste
        'Ajuste: '
        + 'VF = ' + FORMAT(${valorFixo}, 'N2', 'pt-BR') + '; '
        + 'VB = ' + FORMAT(VL_BEM, 'N2', 'pt-BR') + '; '
        + 'TT = ' + FORMAT(TOTAL_VL_BEM, 'N2', 'pt-BR') + ' ; '
        + 'Fórmula = (VF * VB) / TT = ' 
            + FORMAT(CAST(ROUND(ValorRaw,2) AS DECIMAL(18,2)), 'N2', 'pt-BR') + ' ; '
        + 'SR (soma arredondada) = ' + FORMAT(SumRounded, 'N2', 'pt-BR') + ' ; '
        + 'AJ = ' + FORMAT(${valorFixo} - SumRounded, 'N2', 'pt-BR') + ' ; '
        + 'Valor final = ' + FORMAT(
            CAST(ROUND(ValorRaw,2) AS DECIMAL(18,2)) + (${valorFixo} - SumRounded)
          , 'N2', 'pt-BR')
      ELSE
        -- linhas normais: mostra VF, VB, TT, fórmula e resultado desta linha
        'VF = ' + FORMAT(${valorFixo}, 'N2', 'pt-BR') + '; '
        + 'VB = ' + FORMAT(VL_BEM, 'N2', 'pt-BR') + '; '
        + 'TT = ' + FORMAT(TOTAL_VL_BEM, 'N2', 'pt-BR') + ' ; '
        + 'Fórmula = (VF * VB) / TT = ' 
            + FORMAT(CAST(ROUND(ValorRaw,2) AS DECIMAL(18,2)), 'N2', 'pt-BR')
    END AS Calculo

FROM rounded
ORDER BY Represent;`);
  return result;
};

ConsultasDAO.prototype.getAniversariantesMes = async function (req) {
  let mes_nascimento = req.query.mes_nascimento;

  let dados = await this._connection(`select distinct
                                          SUBSTRING(cl.CGC_CPF_CLIENTE,1,3) + '.'
                                          + SUBSTRING(cl.CGC_CPF_CLIENTE,4,3) + '.'
                                          + SUBSTRING(cl.CGC_CPF_CLIENTE,7,3) + '-'
                                          + SUBSTRING(cl.CGC_CPF_CLIENTE,10,2) AS 'DOCUMENTO',
                                          NOME,
                                          E_MAIL as 'E-MAIL',
                                          format (cl.DATA_NASCIMENTO,'dd/MM/yyyy', 'en-US') as 'DATA DE NASCIMENTO'
                                        from clientes cl inner join COTAS ct on cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE and ct.TIPO = cl.tipo
                                        inner join SITUACOES_COBRANCAS sc on sc.codigo_situacao = ct.CODIGO_SITUACAO
                                        inner join GRUPOS g on ct.CODIGO_GRUPO = g.CODIGO_GRUPO
                                        where month(data_nascimento) = ${mes_nascimento} and g.CODIGO_SITUACAO = 'A' and ct.VERSAO = 00 and PESSOA = 'F' and sc.CODIGO_SITUACAO like 'N%%'
                                        order by [DATA DE NASCIMENTO]`);

  let total = await this._connection(`select
                                        count(distinct cl.CGC_CPF_CLIENTE) AS 'TOTAL'
                                      from clientes cl inner join COTAS ct on cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE and ct.TIPO = cl.tipo
                                      inner join SITUACOES_COBRANCAS sc on sc.codigo_situacao = ct.CODIGO_SITUACAO
                                      inner join GRUPOS g on ct.CODIGO_GRUPO = g.CODIGO_GRUPO
                                      where month(data_nascimento) = ${mes_nascimento} and g.CODIGO_SITUACAO = 'A' and ct.VERSAO = 00 and PESSOA = 'F' and sc.CODIGO_SITUACAO like 'N%%'`);

  let result = [dados, total];
  return result;
};

ConsultasDAO.prototype.getAniversariantesPeriodo = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let result = await this._connection(`select distinct
	SUBSTRING(cl.CGC_CPF_CLIENTE,1,3) + '.'
	+ SUBSTRING(cl.CGC_CPF_CLIENTE,4,3) + '.'
	+ SUBSTRING(cl.CGC_CPF_CLIENTE,7,3) + '-'
	+ SUBSTRING(cl.CGC_CPF_CLIENTE,10,2) AS 'DOCUMENTO',
	NOME,
	E_MAIL as 'E_MAIL',
	format (cl.DATA_NASCIMENTO,'dd/MM/yyyy', 'en-US') as 'DATA_NASCIMENTO'
from clientes cl inner join COTAS ct on cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE and ct.TIPO = cl.tipo
inner join SITUACOES_COBRANCAS sc on sc.codigo_situacao = ct.CODIGO_SITUACAO
inner join GRUPOS g on ct.CODIGO_GRUPO = g.CODIGO_GRUPO
WHERE 
    (
        -- Caso o período esteja dentro do mesmo mês e não envolva transição de meses
        MONTH('${data_inicial}') = MONTH('${data_final}') 
        AND MONTH(cl.data_nascimento) = MONTH('${data_inicial}') 
        AND DAY(cl.data_nascimento) BETWEEN DAY('${data_inicial}') AND DAY('${data_final}')
        -- Aplicando as restrições dentro do escopo
        AND g.CODIGO_SITUACAO = 'A'
        AND ct.VERSAO = 00
        AND cl.PESSOA = 'F'
        AND sc.CODIGO_SITUACAO LIKE 'N%'
    )
    OR 
    (
        -- Caso o período abranja dois meses diferentes
        MONTH('${data_inicial}') <> MONTH('${data_final}') 
        AND 
        (
            (MONTH(cl.data_nascimento) = MONTH('${data_inicial}') AND DAY(cl.data_nascimento) >= DAY('${data_inicial}'))
            OR
            (MONTH(cl.data_nascimento) = MONTH('${data_final}') AND DAY(cl.data_nascimento) <= DAY('${data_final}'))
        )
        -- Aplicando as restrições dentro do escopo
        AND g.CODIGO_SITUACAO = 'A'
        AND ct.VERSAO = 00
        AND cl.PESSOA = 'F'
        AND sc.CODIGO_SITUACAO LIKE 'N%'
    )
    OR 
    (
        -- Caso o período abranja a transição de ano (de dezembro para janeiro)
        MONTH('${data_inicial}') = 12 AND MONTH('${data_final}') = 1 
        AND 
        (
            (MONTH(cl.data_nascimento) = 12 AND DAY(cl.data_nascimento) >= DAY('${data_inicial}'))
            OR
            (MONTH(cl.data_nascimento) = 1 AND DAY(cl.data_nascimento) <= DAY('${data_final}'))
        )
        -- Aplicando as restrições dentro do escopo
        AND g.CODIGO_SITUACAO = 'A'
        AND ct.VERSAO = 00
        AND cl.PESSOA = 'F'
        AND sc.CODIGO_SITUACAO LIKE 'N%'
    )
	order by [DATA_NASCIMENTO]`);

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
                                            ,format ((isnull(PAG.VALOR_FC,0)+isnull(PAG2.VALOR_FC,0)+isnull(PAG3.VALOR_FC,0)), 'C', 'pt-br') AS VALOR_FC
                                            ,format ((isnull(PAG.VALOR_TX,0)+isnull(pag2.VALOR_TX,0)+isnull(pag3.VALOR_TX,0)), 'C', 'pt-br') AS VALOR_TX
                                            ,format ((isnull(PAG.VALOR_TOTAL,0)+isnull(pag2.VALOR_TOTAL,0)+ISNULL(PAG3.VALOR_TOTAL,0)), 'C', 'pt-br') AS VALOR_TOTAL
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
  let equipe = req.query.equipe;

  var dados = await this._connection(`select CODIGO_GRUPO as GRUPO,
                                            CODIGO_COTA AS COTA,
                                            VERSAO AS 'VERSÃO',
                                            CT.CODIGO_SITUACAO as 'SITUAÇÃO',
                                            sc.nomenclatura as 'DESCRIÇÃO',
                                            FORMAT(CT.DATA_VENDA, 'dd/MM/yyyy', 'en-US') as 'DATA DA VENDA',
                                            CT.CODIGO_REPRESENTANTE AS 'COD. REP',
                                            rep.NOME 
                                        from COTAS ct 
                                        inner join REPRESENTANTES rep 
                                        on ct.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
                                        inner join SITUACOES_COBRANCAS sc
                                        on ct.CODIGO_SITUACAO = sc.CODIGO_SITUACAO
                                        where ct.DATA_VENDA BETWEEN '${data_inicial}' AND '${data_final}' and rep.codigo_equipe = '${equipe}'
                                        order by rep.CODIGO_REPRESENTANTE `);

  var dadosPorSituacao = await this
    ._connection(`SELECT rep.CODIGO_REPRESENTANTE AS 'REPRESENTANTE',
                                            rep.NOME,
                                            CT.CODIGO_SITUACAO as 'SITUAÇÃO',
                                            sc.NOMENCLATURA as 'DESCRIÇÃO',
                                            COUNT(ct.CODIGO_SITUACAO) AS QUANTIDADE,
                                            format(sum(pp.VALOR_BEM), 'C', 'pt-br') as 'TOTAL VALOR'
                                        from COTAS ct 
                                        inner join REPRESENTANTES rep 
                                        on ct.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
                                        inner join PROPOSTAS pp
                                        on ct.CODIGO_GRUPO = pp.CODIGO_GRUPO and ct.CODIGO_COTA = pp.CODIGO_COTA and ct.VERSAO = pp.VERSAO
                                        inner join SITUACOES_COBRANCAS sc
                                        on ct.CODIGO_SITUACAO = sc.CODIGO_SITUACAO
                                        where ct.DATA_VENDA BETWEEN '${data_inicial}' AND '${data_final}' and rep.codigo_equipe = '${equipe}'
                                        GROUP BY ct.CODIGO_SITUACAO, rep.CODIGO_REPRESENTANTE, rep.NOME, sc.NOMENCLATURA
                                        order by rep.CODIGO_REPRESENTANTE`);
  var result = [dados, dadosPorSituacao];

  return result;
};

ConsultasDAO.prototype.relatorioSeguroBradesco = async function (req) {
  let data_inicial = req.query.contabil_ini;
  let data_final = req.query.contabil_fin;

  let result = await this._connection(`
        select
          ct.NUMERO_CONTRATO as CONTRATO
          ,ct.NUMERO_CONTRATO as 'MATRÍCULA'
          ,case
            when cl.PESSOA = 'F' THEN cl.NOME
            when cl.PESSOA = 'J' THEN cls.NOME
            else cl.NOME
          end as 'NOME'
          ,case
          when cl.PESSOA = 'F' then 
            SUBSTRING(cl.CGC_CPF_CLIENTE,1,3) + '.'
            + SUBSTRING(cl.CGC_CPF_CLIENTE,4,3) + '.'
            + SUBSTRING(cl.CGC_CPF_CLIENTE,7,3) + '-'
            + SUBSTRING(cl.CGC_CPF_CLIENTE,10,2)
          when cl.PESSOA = 'J' then
            SUBSTRING(cls.CGC_CPF_CLIENTE,1,3) + '.'
                + SUBSTRING(cls.CGC_CPF_CLIENTE,4,3) + '.'
                + SUBSTRING(cls.CGC_CPF_CLIENTE,7,3) + '-'
                + SUBSTRING(cls.CGC_CPF_CLIENTE,10,2)
          end AS CPF
          ,convert(CHAR,cl.DATA_NASCIMENTO,103) AS 'DT NASC'
          ,cl.SEXO as SEXO
          ,round((((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO)-(ct.PERCENTUAL_NORMAL+ct.TAXA_ADMINISTRACAO_PAGA+ct.PERCENTUAL_ANTECIPADO))*(valor_bem.PRECO_TABELA/100)),2) AS CAPITAL
          ,case
            when DATA_ADESAO > '20190930' or DATA_TRANSFERENCIA > '20190930'
            THEN '900609'
            else '900502'
          end as 'APÓLICE'
          ,'1' AS SUB
          ,'' AS ESTEIRA
          ,case
            when DATA_ADESAO < DATA_TRANSFERENCIA
            THEN convert(CHAR,ct.DATA_TRANSFERENCIA,103)
            else convert(CHAR,ct.DATA_ADESAO,103)
          end as 'DT INCL'
          ,case
            when cl.PESSOA = 'F' THEN 'PF'
            when cl.PESSOA = 'J' THEN 'PJ'
            else 'PF'
          end as 'TIPO PESSOA'
          ,CAST(round((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO-ct.PERCENTUAL_NORMAL-ct.TAXA_ADMINISTRACAO_PAGA-ct.PERCENTUAL_ANTECIPADO)*(VALOR_BEM.PRECO_TABELA/100*sg.PERCENTUAL_SEG_VIDA/100),2,1) AS DECIMAL(18,2)) as 'PRÊMIO TOTAL'
          ,'' AS GRUPO
          ,'' AS COTA
          ,CT.PRAZO_ORIGINAL_VENDA AS PRAZO
          ,'' AS 'DISTRIBUIDOR RISCO'
          ,MES_ANO.NUMERO_ASSEMBLEIA - CT.NUMERO_ASSEMBLEIA_EMISSAO +1 AS PARCELA
          ,(right(replicate('0',2) + convert(VARCHAR,MONTH(MES_ANO.DATA_CONTABILIZACAO)),2)+CAST(YEAR(MES_ANO.DATA_CONTABILIZACAO) AS CHAR(4))) AS 'MÊS ANO'
          ,case
            when cl.PESSOA = 'F' THEN ''
            when cl.PESSOA = 'J' THEN cl.CGC_CPF_CLIENTE
            else ''
          end as CNPJ
          ,case
            when cl.PESSOA = 'F' THEN ''
            when cl.PESSOA = 'J' THEN cl.NOME
            else ''
          end as 'RAZÃO SOCIAL'
          ,'' as ARQUIVO
          ,'' as PLANILHA
          ,'' as 'CREDOR RAZÃO SOCIAL'
          ,'' as 'CREDOR CNPJ'
          ,(cl.ENDERECO+cl.COMPLEMENTO) as 'ENDEREÇO'
          ,substring(cl.BAIRRO,0,15) AS BAIRRO
          ,substring(cd.NOME,0,15) AS CIDADE
          ,cl.CEP
          ,cd.ESTADO AS UF
          ,'' as FIM
        from
          cotas ct inner join clientes cl on
            ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE
            and ct.TIPO = cl.TIPO
          inner join CIDADES cd on
            case when CL.CODIGO_CIDADE IS NULL THEN CL.CODIGO_CIDADE_COMERCIAL ELSE cl.CODIGO_CIDADE END = cd.CODIGO_CIDADE
          inner join SEGURADORAS sg on
            sg.CODIGO_SEGURADORA = ct.CODIGO_SEGURADORA
          left join CLIENTES_SOCIOS cls on
                  cls.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
          outer apply (
            select 
              top 1 rb.PRECO_TABELA  
            from 
              REAJUSTES_BENS rb 
            where 
              rb.CODIGO_BEM = ct.CODIGO_BEM 
            order by rb.DATA_REAJUSTE desc
          ) as VALOR_BEM
          outer apply (
            select 
              COUNT(*) as Total 
            from 
            COBRANCAS_ESPECIAIS ce 
            where 
              ce.CODIGO_GRUPO = ct.CODIGO_GRUPO  
              and ce.CODIGO_COTA = ct.CODIGO_COTA 
              and ce.VERSAO = ct.VERSAO 
              and STATUS_PARCELA = 'N'
          ) as Parcelas_Quitacao
          outer apply (
            select
            COUNT(*) as Parcelas_Pagas
            from
              MOVIMENTOS_GRUPOS mg
            where
              mg.CODIGO_GRUPO = ct.CODIGO_GRUPO
              and mg.CODIGO_COTA = ct.CODIGO_COTA
              and mg.VERSAO = ct.VERSAO
              and mg.DATA_CONTABILIZACAO between '${data_inicial}' and '${data_final}'
              and mg.CODIGO_MOVIMENTO in ('010','030','040','200')
          ) as PP
          
          outer apply (
            select
            MG.DATA_CONTABILIZACAO, MG.NUMERO_ASSEMBLEIA
            from
              MOVIMENTOS_GRUPOS mg
            where
              mg.CODIGO_GRUPO = ct.CODIGO_GRUPO
              and mg.CODIGO_COTA = ct.CODIGO_COTA
              and mg.VERSAO = ct.VERSAO
              and mg.DATA_CONTABILIZACAO between '${data_inicial}' and '${data_final}'
              and mg.CODIGO_MOVIMENTO in ('010','030','040','200')
          ) as MES_ANO      
        where
          ct.VERSAO < '50'
          and pp.Parcelas_Pagas > 0
          and ct.CODIGO_SEGURADORA = '039'
          and round((((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO)-(ct.PERCENTUAL_NORMAL+ct.TAXA_ADMINISTRACAO_PAGA+ct.PERCENTUAL_ANTECIPADO))*(valor_bem.PRECO_TABELA/100)),2) > 5
          and round((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO-ct.PERCENTUAL_NORMAL-ct.TAXA_ADMINISTRACAO_PAGA-ct.PERCENTUAL_ANTECIPADO)*VALOR_BEM.PRECO_TABELA/100,2)+round((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO-ct.PERCENTUAL_NORMAL-ct.TAXA_ADMINISTRACAO_PAGA-ct.PERCENTUAL_ANTECIPADO)*(VALOR_BEM.PRECO_TABELA/100*sg.PERCENTUAL_SEG_VIDA/100)*parcelas_quitacao.total,2) > 0
        order by
          ct.NUMERO_CONTRATO
    `);

  return result;
};

ConsultasDAO.prototype.relatorioSeguroHdi = async function (req) {
  let data_inicial = req.query.contabil_ini;
  let data_final = req.query.contabil_fin;

  let result = await this._connection(`
        select
  ct.NUMERO_CONTRATO as CONTRATO
  ,case
    when cl.PESSOA = 'F' THEN cl.NOME
    when cl.PESSOA = 'J' THEN cls.NOME
    else cl.NOME
  end as 'NOME'
  ,case
	when cl.PESSOA = 'F' then 
		SUBSTRING(cl.CGC_CPF_CLIENTE,1,3) + '.'
	  + SUBSTRING(cl.CGC_CPF_CLIENTE,4,3) + '.'
	  + SUBSTRING(cl.CGC_CPF_CLIENTE,7,3) + '-'
	  + SUBSTRING(cl.CGC_CPF_CLIENTE,10,2)
	when cl.PESSOA = 'J' then
		SUBSTRING(cls.CGC_CPF_CLIENTE,1,3) + '.'
        + SUBSTRING(cls.CGC_CPF_CLIENTE,4,3) + '.'
        + SUBSTRING(cls.CGC_CPF_CLIENTE,7,3) + '-'
        + SUBSTRING(cls.CGC_CPF_CLIENTE,10,2)
  end AS CPF
  ,convert(CHAR,cl.DATA_NASCIMENTO,103) AS 'DT NASC'
  ,cl.SEXO as SEXO
  ,round((((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO)-(ct.PERCENTUAL_NORMAL+ct.TAXA_ADMINISTRACAO_PAGA+ct.PERCENTUAL_ANTECIPADO))*(valor_bem.PRECO_TABELA/100)),2) AS 'VLR COBERT(CATEGORIA)'
  ,case
    when DATA_ADESAO < DATA_TRANSFERENCIA
    THEN convert(CHAR,ct.DATA_TRANSFERENCIA,103)
    else convert(CHAR,ct.DATA_ADESAO,103)
  end as 'DATA DE ADESÃO'
  ,format(ADS.DATA_CONTABILIZACAO,'dd/MM/yyyy','en-US') as 'DT. ADESÃO SEGURO'
  ,round((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO-ct.PERCENTUAL_NORMAL-ct.TAXA_ADMINISTRACAO_PAGA-ct.PERCENTUAL_ANTECIPADO)*(VALOR_BEM.PRECO_TABELA/100*sg.PERCENTUAL_SEG_VIDA/100),2,1)  as 'PRÊMIO TOTAL'
  ,ct.CODIGO_GRUPO AS GRUPO
  ,ct.CODIGO_COTA AS COTA
  ,case 
    when tgp.DESCRICAO = 'AUTOMOVEIS NACIONAIS' then 'AUTOMÓVEIS'
    else tgp.DESCRICAO
  end as 'TIPO BEM'
  ,CT.PRAZO_ORIGINAL_VENDA AS PRAZO
  ,MES_ANO.NUMERO_ASSEMBLEIA - CT.NUMERO_ASSEMBLEIA_EMISSAO +1 AS PARCELA
  ,(right(replicate('0',2) + convert(VARCHAR,MONTH(MES_ANO.DATA_CONTABILIZACAO)),2)+CAST(YEAR(MES_ANO.DATA_CONTABILIZACAO) AS CHAR(4))) AS 'MÊS ANO'
from
  cotas ct inner join clientes cl on
    ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE
    and ct.TIPO = cl.TIPO
  inner join CIDADES cd on
    case when CL.CODIGO_CIDADE IS NULL THEN CL.CODIGO_CIDADE_COMERCIAL ELSE cl.CODIGO_CIDADE END = cd.CODIGO_CIDADE
  inner join SEGURADORAS sg on
    sg.CODIGO_SEGURADORA = ct.CODIGO_SEGURADORA
  left join CLIENTES_SOCIOS cls on
          cls.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
  left join GRUPOS gp on
		  ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
  left join TIPOS_GRUPOS tgp on
		  gp.CODIGO_TIPO_GRUPO = tgp.CODIGO_TIPO_GRUPO
  outer apply (
    select 
      top 1 rb.PRECO_TABELA  
    from 
      REAJUSTES_BENS rb 
    where 
      rb.CODIGO_BEM = ct.CODIGO_BEM 
    order by rb.DATA_REAJUSTE desc
  ) as VALOR_BEM
  outer apply (
    select 
      COUNT(*) as Total 
    from 
    COBRANCAS_ESPECIAIS ce 
    where 
      ce.CODIGO_GRUPO = ct.CODIGO_GRUPO  
      and ce.CODIGO_COTA = ct.CODIGO_COTA 
      and ce.VERSAO = ct.VERSAO 
      and STATUS_PARCELA = 'N'
  ) as Parcelas_Quitacao
  outer apply (
    select
     COUNT(*) as Parcelas_Pagas
    from
      MOVIMENTOS_GRUPOS mg
    where
      mg.CODIGO_GRUPO = ct.CODIGO_GRUPO
      and mg.CODIGO_COTA = ct.CODIGO_COTA
      and mg.VERSAO = ct.VERSAO
      and mg.AVISO_ESTORNO = 0
	  and mg.CODIGO_SEGURADORA = 40 -- in (40,39) -- 39 - Bradesco   40 - HDI
      and mg.DATA_CONTABILIZACAO between '${data_inicial}' and '${data_final}'
      and mg.CODIGO_MOVIMENTO in ('010','030','040','200')
  ) as PP
  outer apply (
    select
        MIN(mg.DATA_CONTABILIZACAO) as DATA_CONTABILIZACAO
    from
        MOVIMENTOS_GRUPOS mg
    where
        mg.CODIGO_GRUPO = ct.CODIGO_GRUPO
        and mg.CODIGO_COTA = ct.CODIGO_COTA
        and mg.VERSAO = ct.VERSAO
        and mg.AVISO_ESTORNO = 0
        and mg.CODIGO_SEGURADORA = 40 -- in (40,39) -- 39 - Bradesco   40 - HDI
        and mg.CODIGO_MOVIMENTO in ('010','030','040','200')
	) as ADS
  outer apply (
    select
     MG.DATA_CONTABILIZACAO, MG.NUMERO_ASSEMBLEIA
    from
      MOVIMENTOS_GRUPOS mg
    where
      mg.CODIGO_GRUPO = ct.CODIGO_GRUPO
      and mg.CODIGO_COTA = ct.CODIGO_COTA
      and mg.VERSAO = ct.VERSAO
      and mg.AVISO_ESTORNO = 0
      and mg.DATA_CONTABILIZACAO between '${data_inicial}' and '${data_final}'
      and mg.CODIGO_MOVIMENTO in ('010','030','040','200')
  ) as MES_ANO      
where
   ct.VERSAO < '50'
  and pp.Parcelas_Pagas > 0
  and ct.CODIGO_SEGURADORA = '040'
  and round((((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO)-(ct.PERCENTUAL_NORMAL+ct.TAXA_ADMINISTRACAO_PAGA+ct.PERCENTUAL_ANTECIPADO))*(valor_bem.PRECO_TABELA/100)),2) > 5
  and round((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO-ct.PERCENTUAL_NORMAL-ct.TAXA_ADMINISTRACAO_PAGA-ct.PERCENTUAL_ANTECIPADO)*VALOR_BEM.PRECO_TABELA/100,2)+round((100+ct.PERCENTUAL_TAXA_ADMINISTRACAO-ct.PERCENTUAL_NORMAL-ct.TAXA_ADMINISTRACAO_PAGA-ct.PERCENTUAL_ANTECIPADO)*(VALOR_BEM.PRECO_TABELA/100*sg.PERCENTUAL_SEG_VIDA/100)*parcelas_quitacao.total,2) > 0
order by
  ct.NUMERO_CONTRATO
    `);
  return result;
};

ConsultasDAO.prototype.selecionaPeriodoComissao = async function (req) {
  let periodo = req.query.periodo;

  let result = await this._connection(`select top 18
                                          format (DATA_CONTABILIZACAO_INICIAL,'dd/MM/yyyy', 'en-US') as 'DATA INICIAL',
                                          format (DATA_CONTABILIZACAO_FINAL,'dd/MM/yyyy', 'en-US') as 'DATA FINAL'
                                       from PERIODOS_COMISSOES
                                       where CODIGO_PERIODO = ${periodo}
                                       order by DATA_CONTABILIZACAO_FINAL desc`);
  return result;
};

ConsultasDAO.prototype.selecionaRepresentantes = async function (req) {
  let result = await this._connection(`select 
                                          CODIGO_REPRESENTANTE as 'CODIGO',
                                          NOME
                                        from REPRESENTANTES 
                                        where SITUACAO = 'N' 
                                        order by NOME`);
  return result;
};

ConsultasDAO.prototype.selecionaEquipes = async function (req) {
  let result = await this._connection(`select 
                                          CODIGO_EQUIPE as 'CODIGO',
                                          DESCRICAO
                                        from EQUIPES_VENDAS
                                        WHERE ATIVO = 'S'`);
  return result;
};

ConsultasDAO.prototype.selecionaCliente = async function (req) {
  let doc = req.query.documento;

  let result = await this._connection(`Select CGC_CPF_CLIENTE as 'CPF/CNPJ',
                                        NOME,
                                        E_MAIL 
                                        from clientes where CGC_CPF_CLIENTE = '${doc}'`);

  return result;
};

ConsultasDAO.prototype.selecionaContatosCliente = async function (req) {
  let grupo = req.query.grupo;
  let cota = req.query.cota;
  let versao = req.query.versao;

  let result = await this._connection(`select cl.CGC_CPF_CLIENTE as 'CPF_CNPJ', 
        cl.NOME,
				cl.E_MAIL, 
				DDD_COMERCIAL,
				DDD_OUTRO,
				DDD_RESIDENCIAL,
				CELULAR, 
				FONE_FAX,
				FONE_FAX_2,
				FONE_FAX_COMERCIAL, 
				FONE_FAX_OUTRO 
from cotas ct inner join clientes cl
on ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE and ct.TIPO = cl.TIPO
where ct.CODIGO_GRUPO = ${grupo} and ct.CODIGO_COTA = ${cota} and VERSAO = ${versao}`);
  return result;
};

ConsultasDAO.prototype.selecionaTabTel = async function (req) {
  let doc = req.query.documento;

  let result = await this._connection(
    `select DDD, FONE_FAX as 'FONE' from TELEFONES_COTAS where CGC_CPF_CLIENTE = '${doc}'`,
  );

  return result;
};

ConsultasDAO.prototype.relatorioPerfilVendas = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;

  let result = await this._connection(`select 
                                          format (cT.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA',
                                          ct.CGC_CPF_CLIENTE as 'CPF/CNPJ',
                                          CODIGO_GRUPO as 'GRUPO',
                                          CODIGO_COTA AS 'COTA',
                                          ct.VERSAO,
                                          format (cL.DATA_NASCIMENTO,'dd/MM/yyyy', 'en-US') as 'DATA DE NASC.',
                                          (CASE WHEN CL.ESTADO_CIVIL = 'C' THEN 'CASADO' ELSE 
                                          (CASE WHEN CL.ESTADO_CIVIL = 'S' THEN 'SOLTEIRO' ELSE
                                          (CASE WHEN CL.ESTADO_CIVIL = 'V' THEN 'VIUVO' ELSE
                                          (CASE WHEN CL.ESTADO_CIVIL = 'D' THEN 'DIVORCIADO' ELSE
                                          (CASE WHEN CL.ESTADO_CIVIL = 'U' THEN 'UNIÃO ESTAVEL' ELSE
                                          (CASE WHEN CL.ESTADO_CIVIL = 'A' THEN '--------------' END)END) END) END) END) END) AS 'ESTADO CIVIL',
                                          (CASE WHEN CL.SEXO = 'F' THEN 'FEMININO' ELSE 
                                          (CASE WHEN CL.SEXO = 'M' THEN 'MASCULINO' ELSE 
                                          (CASE WHEN CL.SEXO = 'A' THEN '--------------' END)END) END) AS 'SEXO',
                                          IIF(CL.PESSOA = 'F', 'FISICA', 'JURIDICA') AS 'TIPO DE PESSOA',
                                          cid.ESTADO,
                                          cid.NOME as 'CIDADE'
                                          from COTAS CT inner JOIN CLIENTES CL ON CT.CGC_CPF_CLIENTE = CL.CGC_CPF_CLIENTE and ct.TIPO = cl.TIPO
                                          left join CIDADES cid on cl.CODIGO_CIDADE = cid.CODIGO_CIDADE
                                          where DATA_VENDA between '${data_inicial}' and '${data_final}' and ct.VERSAO in (0,40,41)
                                          ORDER BY CT.DATA_VENDA`);
  return result;
};

ConsultasDAO.prototype.relatorioTipoVendas = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let versao_inicial = req.query.versao_inicial;
  let versao_final = req.query.versao_final;

  let result = await this._connection(`select
      ct.CODIGO_GRUPO as 'GRUPO',
      ct.CODIGO_COTA AS 'COTA',
      ct.VERSAO,
      ct.NUMERO_CONTRATO as 'CONTRATO',
      format (cT.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA VENDA',
      ct.PRAZO_ORIGINAL_VENDA as 'PLANO COTA',
      ct.CODIGO_TIPO_GRUPO as 'TIPO GRUPO',
      format(pp.VALOR_BEM,'C', 'pt-br') as 'VALOR BEM',
      ct.CODIGO_EQUIPE as 'EQUIPE',
      ct.CODIGO_REPRESENTANTE as 'REPRESENTANTE',
      CT.CODIGO_PLANO_ESPECIAL AS 'PLANO VENDA',
      CT.CODIGO_TIPO_VENDA AS 'TIPO VENDA',
      tv.DESCRICAO as 'DESCRIÇÃO TIPO DE VENDA',
      ct.CODIGO_SEGURADORA as 'SEGURADORA'
      from COTAS CT inner join PROPOSTAS pp
      on ct.CODIGO_GRUPO = pp.CODIGO_GRUPO and ct.CODIGO_COTA = pp.CODIGO_COTA and ct.VERSAO = pp.VERSAO
      INNER JOIN TIPOS_VENDAS tv
      on ct.CODIGO_TIPO_VENDA = tv.CODIGO_TIPO_VENDA
      where ct.DATA_VENDA between '${data_inicial}' and '${data_final}' and ct.VERSAO BETWEEN ${versao_inicial} AND ${versao_final}
      ORDER BY CT.DATA_VENDA`);
  return result;
};

ConsultasDAO.prototype.relatorioVendasTabelaComissao = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;

  let result = await this._connection(`
          select 
        format (cT.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DT. VENDA',
        CODIGO_GRUPO as 'GRUPO',
        CODIGO_COTA AS 'COTA',
        ct.VERSAO as 'V.',
        concat(rep.CODIGO_REPRESENTANTE,' - ',rep.NOME) as 'REPRESENTANTE',
        CT.CODIGO_TABELA_COMISSAO AS 'TAB. COMISSÃO'
      from COTAS CT inner JOIN CLIENTES CL ON CT.CGC_CPF_CLIENTE = CL.CGC_CPF_CLIENTE and ct.TIPO = cl.TIPO
        left join REPRESENTANTES rep
        on ct.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
      where 
        DATA_VENDA between '${data_inicial}' and '${data_final}' 
        and ct.VERSAO in (0,40,41) 
        --and (ct.CODIGO_TABELA_COMISSAO is null or ct.CODIGO_TABELA_COMISSAO = 0)
      ORDER BY CT.DATA_VENDA 
    `);
  return result;
};

ConsultasDAO.prototype.selecionaEstados = async function (req) {
  let result = await this._connection(
    `select distinct Estado from CIDADES order by estado`,
  );
  return result;
};

ConsultasDAO.prototype.selecionaCotasAtivasComEmail = async function (req) {
  let result = await this._connection(
    `select
        format(ct.DATA_ADESAO,'dd/MM/yyyy', 'en-US') as 'ADESÃO',
        ct.CODIGO_GRUPO as 'GRUPO',
        ct.CODIGO_COTA as 'COTA',
        ct.VERSAO as 'VS.',
        cl.NOME as 'NOME',
        Cl.DDD_RESIDENCIAL as 'DDD',
        Cl.fone_fax as 'TELEFONE',
        cl.CELULAR as 'CELULAR',
        tc.DDD as 'DDD TAB.',
        tc.FONE_FAX as 'TELEFONE TAB.',	
        cl.E_MAIL as 'E-MAIL'
      from clientes cl inner join cotas ct
        on cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE and cl.TIPO = ct.tipo
        inner join GRUPOS gp
        on ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
        LEFT JOIN TELEFONES_COTAS TC 
        ON CL.CGC_CPF_CLIENTE = TC.CGC_CPF_CLIENTE
      where gp.CODIGO_SITUACAO = 'A' 
        and ct.VERSAO = 00 and ct.CODIGO_SITUACAO not like 'Q%'
        and cl.E_MAIL is not null and cl.E_MAIL like '%@%'
      order by ct.CODIGO_GRUPO, ct.CODIGO_COTA, ct.VERSAO`,
  );
  return result;
};

ConsultasDAO.prototype.situacaoCotasEstado = async function (req) {
  let estado = req.query.estado;
  let filtroContemplacao = req.query.filtroContemplacao;
  const estados = estado?.split(",").filter((e) => e); // remove vazios
  const estadosSql = estados.map((uf) => `'${uf}'`).join(","); // "'BA','AM'"
  if (req.query.detalhado == 0) {
    result = await this._connection(
      `select cid.ESTADO,ct.CODIGO_SITUACAO as 'CÓDIGO',
              SC.DESCRICAO AS 'DESCRIÇÃO',
              case
                when ct.DATA_CONTEMPLACAO is null AND ccc.DATA_CONTEMPLACAO is NULL
                  then 'NÃO CONTEMPLADO'
                WHEN ct.DATA_CONTEMPLACAO is not null or ccc.DATA_CONTEMPLACAO is not NULL
                  THEN 'CONTEMPLADO'
                END AS 'CONTEMPLAÇÃO',
				count(ct.numero_contrato) as TOTAL
          from cotas ct inner join CLIENTES cl
          on ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE and ct.tipo = cl.tipo
          left join COTAS_CONTEMPLADAS_CANCELADAS ccc
          on ccc.ID_COTA = ct.ID_COTA
          inner join GRUPOS gp
          on ct.codigo_grupo = gp.codigo_grupo
          inner join SITUACOES_COBRANCAS sc
          on ct.CODIGO_SITUACAO = sc.CODIGO_SITUACAO
          inner join cidades cid
          on cl.CODIGO_CIDADE = cid.CODIGO_CIDADE
          where cid.ESTADO in (${estadosSql}) and gp.CODIGO_SITUACAO = 'A' ${filtroContemplacao}
          group by cid.estado,ct.CODIGO_SITUACAO,SC.DESCRICAO,case
                when ct.DATA_CONTEMPLACAO is null AND ccc.DATA_CONTEMPLACAO is NULL
                  then 'NÃO CONTEMPLADO'
                WHEN ct.DATA_CONTEMPLACAO is not null or ccc.DATA_CONTEMPLACAO is not NULL
                  THEN 'CONTEMPLADO'
                END
          order by cid.estado,ct.CODIGO_SITUACAO, [CONTEMPLAÇÃO]`,
    );
  } else if (req.query.detalhado == 1) {
    result = await this._connection(
      `select ct.CODIGO_GRUPO as 'GRUPO',
            ct.CODIGO_COTA as 'COTA',
            ct.VERSAO as 'VER.',
            format(ct.DATA_ADESAO, 'dd/MM/yyyy', 'en-US') AS 'ADESÃO',
            format(ct.VALOR_FUNDO_COMUM, 'C', 'pt-br') as 'VALOR FC PAGO',
            sc.NOMENCLATURA as 'SITUAÇÃO',
            case
              when ct.DATA_CONTEMPLACAO is null AND ccc.DATA_CONTEMPLACAO is NULL
                then 'NÃO CONTEMPLADO'
              WHEN ct.DATA_CONTEMPLACAO is not null or ccc.DATA_CONTEMPLACAO is not NULL
                THEN 'CONTEMPLADO'
              END AS 'CONTEMPLAÇÃO',
            cl.NOME as 'NOME',
            cid.NOME as 'CIDADE',
            cid.ESTADO as 'UF'		
        from cotas ct inner join clientes cl 
        on ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE 
        inner join CIDADES cid
        on cid.CODIGO_CIDADE = cl.CODIGO_CIDADE
        inner join SITUACOES_COBRANCAS sc
        on ct.CODIGO_SITUACAO = sc.CODIGO_SITUACAO
        inner join GRUPOS gp
        on ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
        left join COTAS_CONTEMPLADAS_CANCELADAS ccc
        on ccc.ID_COTA = ct.ID_COTA
        where cid.ESTADO in (${estadosSql}) and gp.CODIGO_SITUACAO = 'A' ${filtroContemplacao}
        order by cid.estado,ct.CODIGO_SITUACAO, [CONTEMPLAÇÃO]`,
    );
  }
  return result;
};

ConsultasDAO.prototype.verificacaoNacionalidade = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO,
      ct.codigo_situacao as 'SITUAÇÃO', 
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA', 
      cl.NACIONALIDADE 
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A' /*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'F' /*Filtro Somente Pessoa Fisica*/
      and (cl.NACIONALIDADE is null or LEN(cl.NACIONALIDADE) < 2 )/*Filtro campo sem nacionalidade*/
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoNome = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO,
      ct.codigo_situacao as 'SITUAÇÃO', 
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA',
      cl.NOME
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'F' /*Filtro Somente Pessoa Fisica*/
      and len(cl.nome) < 10 /*Nomes com menos de 10 caracteres*/
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoFiliacao = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA',
      cl.NOME_MAE as 'NOME DA MÃE', cl.NOME_PAI as 'NOME DO PAI'
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'F' /*Filtro Somente Pessoa Fisica*/
      and len(cl.NOME_MAE) < 10 /*Sem Filiação*/
	    and len(cl.NOME_PAI) < 10
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoDtNascimento = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA', 
      cl.DATA_NASCIMENTO as 'DATA NASCIMENTO'
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'F' /*Filtro Somente Pessoa Fisica*/
      and cl.DATA_NASCIMENTO is null
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoLocalNascimento = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO,
      ct.codigo_situacao as 'SITUAÇÃO', 
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA', 
      cl.NATURALIDADE
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'F' /*Filtro Somente Pessoa Fisica*/
      and cl.NATURALIDADE is null
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoNumeroRg = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA', 
      cl.DOCUMENTO
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'F' /*Filtro Somente Pessoa Fisica*/
      and cl.DOCUMENTO is null
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoDtEmissaoRg = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA', 
      cl.DATA_EXP_DOC as 'DATA DE EXPEDIÇÃO'
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'F' /*Filtro Somente Pessoa Fisica*/
      and cl.DATA_EXP_DOC is null
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoOrgaoExpedicaoRg = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA', 
      cl.ORGAO_EMISSOR AS 'ORGÃO EMISSOR'
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'F' /*Filtro Somente Pessoa Fisica*/
      and cl.ORGAO_EMISSOR is null
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoSemRendaPf = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA',
        cl.NOME,
        cl.RENDA 
    from clientes cl inner join cotas ct
      on cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE and cl.TIPO = ct.tipo inner join GRUPOS gp
      on ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where 
      RENDA < 0.1 
      and gp.CODIGO_SITUACAO = 'A'
      and cl.PESSOA = 'F'
      ${filtro}
    order by ct.CODIGO_GRUPO,CODIGO_COTA,VERSAO
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoFirmaDenominacaoSocial = async function (
  req,
) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA',
      cl.NOME AS 'DENOMINAÇÃO SOCIAL'
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'J' /*Filtro Somente Pessoa Juridica*/
      and LEN(cl.NOME) < 10
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoAtivoPrincipal = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA',
      cl.RENDA
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'J' /*Filtro Somente Pessoa Juridica*/
      and cl.RENDA < 100
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoDataConstituicao = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA',
      cl.DATA_NASCIMENTO AS 'DATA DA CONSTITUIÇÃO'
    from 
      CLIENTES cl inner join COTAS ct on
        cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE
        and cl.TIPO = ct.TIPO
      inner join GRUPOS gp on
        ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where
      gp.CODIGO_SITUACAO = 'A'/*Filtro Somente grupos ativos*/
      and cl.PESSOA = 'J' /*Filtro Somente Pessoa Juridica*/
      and cl.DATA_NASCIMENTO is null
      ${filtro}
    `,
  );
  return result;
};

ConsultasDAO.prototype.verificacaoSemRendaPj = async function (req) {
  let filtroCotasAtivas = req.query.apenasCotasAtivas;
  let filtroQuitados = req.query.quitados;
  let filtro = geraFiltroSql(filtroCotasAtivas, filtroQuitados);
  let result = await this._connection(
    `select 
      ct.CODIGO_GRUPO as 'GRUPO', 
      ct.CODIGO_COTA as 'COTA', 
      ct.VERSAO, 
      ct.codigo_situacao as 'SITUAÇÃO',
      format (ct.DATA_VENDA,'dd/MM/yyyy', 'en-US') AS 'DATA DA VENDA',
        cl.NOME,
        cl.RENDA 
    from clientes cl inner join cotas ct
      on cl.CGC_CPF_CLIENTE = ct.CGC_CPF_CLIENTE and cl.TIPO = ct.tipo inner join GRUPOS gp
      on ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
    where 
      RENDA < 0.1 
      and gp.CODIGO_SITUACAO = 'A'
      and cl.PESSOA = 'J' /*Filtro Somente Pessoa Juridica*/
      ${filtro}
    order by ct.CODIGO_GRUPO,CODIGO_COTA,VERSAO
    `,
  );
  return result;
};

ConsultasDAO.prototype.cotasNaoContempParQuitacao = async function (req) {
  let qtdParcelas = req.query.qtdParcelas;
  let result = await this._connection(
    `SELECT 
    ce.CODIGO_GRUPO as 'Grupo',
    ce.CODIGO_COTA as 'Cota',
    ce.VERSAO as 'Versão',
    FORMAT(ct.DATA_ADESAO, 'dd/MM/yyyy', 'en-US') as 'Adesão',
    FORMAT((ct.VALOR_FUNDO_COMUM + ct.VALOR_TAXA_ADMINISTRACAO + ct.VALOR_MULTA + ct.VALOR_JUROS + ct.VALOR_SEGURO),
	'C', 'pt-br') as 'Total Pago',
    format(((((100 - ct.PERCENTUAL_IDEAL_DEVIDO) + (ct.PERCENTUAL_TAXA_ADMINISTRACAO - ct.TAXA_ADMINISTRACAO_PAGA)) * ValorBem.PRECO_TABELA) / 100),
	'C','pt-br') as 'Saldo Dev. FC + TX',
    format(ValorBem.PRECO_TABELA,'C','pt-br') as 'Crédito Atual',
    COUNT(ce.STATUS_PARCELA) AS 'Parcelas abertas',
    (
        SELECT COUNT(cob.CODIGO_MOVIMENTO)
        FROM COBRANCAS cob 
        WHERE cob.CODIGO_GRUPO = ce.CODIGO_GRUPO 
          AND cob.CODIGO_COTA = ce.CODIGO_COTA 
          AND cob.VERSAO = ce.VERSAO 
          AND cob.CODIGO_MOVIMENTO = 270
          AND cob.ORIGEM_LANCAMENTO = 'TA'
    ) as 'Termos',
    (COUNT(ce.STATUS_PARCELA) - (
        SELECT COUNT(cob.CODIGO_MOVIMENTO)
        FROM COBRANCAS cob 
        WHERE cob.CODIGO_GRUPO = ce.CODIGO_GRUPO 
          AND cob.CODIGO_COTA = ce.CODIGO_COTA 
          AND cob.VERSAO = ce.VERSAO 
          AND cob.CODIGO_MOVIMENTO = 270
          AND cob.ORIGEM_LANCAMENTO = 'TA'
    )) as 'Parcelas totais em aberto'
FROM cotas ct
OUTER APPLY (
    SELECT TOP 1 preco_tabela 
    FROM REAJUSTES_BENS rb
    WHERE ct.codigo_bem = rb.CODIGO_BEM 
    ORDER BY DATA_REAJUSTE DESC
) as ValorBem
INNER JOIN GRUPOS gp 
    ON ct.CODIGO_GRUPO = gp.CODIGO_GRUPO
INNER JOIN COBRANCAS_ESPECIAIS ce
    ON ct.CODIGO_GRUPO = ce.CODIGO_GRUPO 
    AND ct.CODIGO_COTA = ce.CODIGO_COTA 
    AND ct.VERSAO = ce.VERSAO
WHERE 
    ct.DATA_CONTEMPLACAO IS NULL 
    AND ct.VERSAO = 0 
    AND gp.CODIGO_SITUACAO = 'A' 
    AND ce.STATUS_PARCELA = 'N'
    AND ce.CODIGO_MOVIMENTO = 10
GROUP BY 
    ce.CODIGO_GRUPO,
    ce.CODIGO_COTA,
    ce.VERSAO,
    ct.DATA_ADESAO,
    ct.VALOR_FUNDO_COMUM,
    ct.VALOR_TAXA_ADMINISTRACAO,
    ct.VALOR_MULTA,
    ct.VALOR_JUROS,
    ct.VALOR_SEGURO,
    ValorBem.PRECO_TABELA,
    ct.PERCENTUAL_IDEAL_DEVIDO,
    ct.PERCENTUAL_TAXA_ADMINISTRACAO,
    ct.TAXA_ADMINISTRACAO_PAGA
HAVING 
    (COUNT(ce.STATUS_PARCELA) - (
        SELECT COUNT(cob.CODIGO_MOVIMENTO)
        FROM COBRANCAS cob 
        WHERE cob.CODIGO_GRUPO = ce.CODIGO_GRUPO 
          AND cob.CODIGO_COTA = ce.CODIGO_COTA 
          AND cob.VERSAO = ce.VERSAO 
          AND cob.CODIGO_MOVIMENTO = 270
          AND cob.ORIGEM_LANCAMENTO = 'TA'
    )) <=  ${qtdParcelas};
`,
  );
  return result;
};

ConsultasDAO.prototype.dadosCliente = async function (req) {
  let doc = req.query.doc;
  let result = await this._connection(
    `select 
      c.CGC_CPF_CLIENTE 'CPF/CNPJ',
      AJ.DESCRICAO AS 'ATIVIDADE JURÍDICA',
      c.NOME,
      c.ENDERECO AS 'ENDEREÇO',
      c.BAIRRO,
      cid.NOME as 'CIDADE',
      CEP,
      c.FONE_FAX 'TELEFONE',											
      c.RAMAL,
      format (c.DATA_NASCIMENTO,'dd/MM/yyyy', 'en-US') as 'DATA DE NASCIMENTO',
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
      C.FONE_FAX_COMERCIAL AS 'TELEFONE (COMERCIAL)',
      C.RAMAL_COMERCIAL AS 'RAMAL (COMERCIAL)',
      C.NOME_CONJUGE as 'NOME (CÔNJUGUE)',
      c.DOCUMENTO_CONJUGE AS 'DOCUMENTO (CÔNJUGUE)',
      C.NACIONALIDADE_CONJUGE AS 'NACIONALIDADE (CÔNJUGUE)',
      C.CPF_CONJUGE AS 'CPF (CONJUGUE)',
      format (c.DATA_NASCIMENTO_CONJUGE,'dd/MM/yyyy', 'en-US') as 'DATA DE NASCIMENTO (CÔNJUGUE)',
      (select P.DESCRICAO from PROFISSOES where CODIGO_PROFISSAO = c.CODIGO_PROFISSAO_CONJUGE) AS 'PROFISSÃO (CÔNJUGUE)',
      c.ENDERECO_OUTRO as 'ENDEREÇO ALTERNATIVO',
      c.BAIRRO_OUTRO as 'BAIRRO ALTERNATIVO',
      C.COMPLEMENTO_OUTRO AS 'COMPLEMENTO ALTERNATIVO',
      C.CEP_OUTRO AS 'CEP ALTERNATIVO',
      c.E_MAIL as 'E-mail',
      C.FONE_FAX_OUTRO as 'TELEFONE ALTERNATIVO',
      c.RAMAL_OUTRO as 'RAMAL ALTERNATIVO',
      C.CODIGO_CIDADE_OUTRO 'CÓDIGO DA CIDADE ALTERNATIVO',
      C.CAIXA_POSTAL AS 'CAIXA POSTAL',
      C.CAIXA_POSTAL_COMERCIAL AS 'CAIXA POSTAL COMERCIAL',
      C.CAIXA_POSTAL_OUTRO AS 'CAIXA POSTAL ALTERNATIVO',
      c.DDD_RESIDENCIAL AS 'DDD RESIDENCIAL',
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
      C.DDD_COMERCIAL AS 'DDD COMERCIAL',
      C.DDD_OUTRO AS 'DDD ALTERNATIVO',
      C.RENDA AS 'RENDA',
      C.NOME_PAI AS 'NOME DO PAI',
      C.NOME_MAE AS 'NOME DA MÃE',
      C.NATURALIDADE,
      C.NATURALIDADE_CONJUGE AS 'NATURALIDADE DO CÔNJUGUE',
      C.NUMERO_DEPENDENTES AS 'NÚMERO DE DEPENDENTES',
      C.FONE_FAX_2 AS 'FONE FAX 2',
      C.FAX,
      C.UF_DOC_CLIENTE AS 'UF DO DOCUMENTO',
      C.UF_DOC_CONJUGE AS 'UF DO DOC. CÔNJUGUE',
      REG.DESCRICAO AS 'REGIME DO CASAMENTO',
      C.SEXO_CONJUGE AS 'SEXO DO CÔNJUGUE',
      DOC.DESCRICAO AS 'DOCUMENTO DE INDENTIFICAÇÃO',
      (select DISTINCT DOC.DESCRICAO from TIPOS_DOC_IDENTIFICACAO where DOC.CODIGO_TIPO_DOC_IDENT = C.CODIGO_TIPO_DOC_IDENT_CONJ) AS 'DOC. DE INDENTIFICAÇÃO DO CÔNJUGUE',
      format (C.DATA_EXP_DOC,'dd/MM/yyyy', 'en-US') as 'DATA DE EXPEDIÇÃO',
      format (C.DATA_EXP_DOC_CONJUGE,'dd/MM/yyyy', 'en-US') as 'DATA DE EXPEDIÇÃO (CÔNJUGUE)',
      C.Endereco_Conjuge AS 'ENDEREÇO DO CÔNJUGUE'
      from CLIENTES c 
      LEFT join PROFISSOES p on c.CODIGO_PROFISSAO = p.CODIGO_PROFISSAO 
      LEFT JOIN REGIMES_CASAMENTO REG ON C.REGIME_CASAMENTO = REG.REGIME_CASAMENTO 
      LEFT JOIN ATIVIDADES_JURIDICAS AJ ON C.CODIGO_ATIVIDADE_JURIDICA = AJ.CODIGO_ATIVIDADE_JURIDICA
      LEFT JOIN TIPOS_DOC_IDENTIFICACAO DOC on C.CODIGO_TIPO_DOC_IDENT = DOC.CODIGO_TIPO_DOC_IDENT
      left join CIDADES cid on c.CODIGO_CIDADE = cid.CODIGO_CIDADE
      where CGC_CPF_CLIENTE = '${doc}'
`,
  );
  return result;
};

ConsultasDAO.prototype.docPorCota = async function (req) {
  let grupo = req.query.grupo;
  let cota = req.query.cota;
  let versao = req.query.versao;

  let result = await this._connection(
    `
    select CGC_CPF_CLIENTE as 'DOC' from cotas 
    where codigo_grupo = ${grupo} and CODIGO_COTA = ${cota} and versao = ${versao}
`,
  );
  return result;
};

ConsultasDAO.prototype.docPorPlaca = async function (req) {
  let placa = req.query.placa;
  let result = await this._connection(
    `
    select 
    ct.CGC_CPF_CLIENTE as 'DOC'
    from CONTROLES_OPCOES co inner join cotas ct
    on co.codigo_grupo = ct.codigo_grupo and co.CODIGO_COTA = ct.CODIGO_COTA and co.VERSAO = ct.VERSAO
    where placa = '${placa}'
`,
  );
  return result;
};

ConsultasDAO.prototype.historicoCota = async function (req) {
  let grupo = req.query.grupo;
  let cota = req.query.cota;
  let versao = req.query.versao;

  let result = await this._connection(
    `select 
      hc.ID_HISTORICO_CONSORCIADO as id_evento,
      format(hc.DATA_OCORRENCIA,'dd/MM/yyyy','en-US') as data_evento,
      us.NOME as usuario,
      hc.OCORRENCIA as ocorrencia,
      df.DESCRICAO as motivo
    from HISTORICOS_CONSORCIADOS hc 
    inner join USUARIOS us
    on hc.CODIGO_USUARIO = us.CODIGO_USUARIO
    inner join DEF_HISTORICOS df
    on hc.CODIGO_FASE = df.CODIGO_FASE
    where hc.codigo_grupo = ${grupo} and hc.CODIGO_COTA = ${cota} and hc.versao = ${versao}
    order by hc.DATA_OCORRENCIA
`,
  );
  return result;
};
ConsultasDAO.prototype.movimentosFinanceirosCota = async function (req) {
  let grupo = req.query.grupo;
  let cota = req.query.cota;
  let versao = req.query.versao;
  let codMovimentos = req.query.codMovs;
  const codigos = codMovimentos?.split(",").filter((e) => e);
  const codigosSql = codigos.map((cod) => `${cod}`).join(",");

  let result = await this._connection(
    `
    select 
	mg.NUMERO_AVISO as aviso,
	mg.AVISO_ESTORNO as aviso_estorno,
	mg.NUMERO_LOTE as lote,
	me.DESCRICAO as motivo_estorno,
	mg.CODIGO_AGENTE_FINANCEIRO as agente,
	b.DESCRICAO as bem,
	us.NOME as usuario,
	concat(mg.CODIGO_TIPO_MOVIMENTO,' - ',tm.DESCRICAO) as tipo_movimento,
	concat(mg.CODIGO_MOVIMENTO,' - ',cm.DESCRICAO) as movimento,
	CASE 
    WHEN mg.CODIGO_MOVIMENTO in (10,60,110,130,750)
        THEN mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1
		ELSE 0
	END AS parcela,
	format(mg.DATA_CONTABILIZACAO,'dd/MM/yyyy', 'en-US') as contabilizacao,
	format(mg.DATA_PAGAMENTO,'dd/MM/yyyy', 'en-US') as pagamento,
	format(mg.DATA_VENCIMENTO,'dd/MM/yyyy', 'en-US') as vencimento,
	mg.COMPLEMENTO_HISTORICO as complemento_historico,
	mg.DOCUMENTO as documento,
	mg.PERCENTUAL_IDEAL as '% ideal',
	mg.PERCENTUAL_NORMAL as '% normal',
	mg.PERCENTUAL_ANTECIPADO as '% antecipado',
	mg.PERCENTUAL_RATEIO as '% rateio',
	mg.TOTAL_LANCAMENTO as total_lancamento,
	format(mg.VALOR_BEM,'C','pt-BR') as valor_bem,
	mg.VALOR_MULTA_JUROS as multa_juros,
	mg.VALOR_OUTROS as outros_valores,
	mg.VALOR_RATEIO as valor_rateio,
	mg.VALOR_REPASSE_MULTA as valor_repasse_multa,
	mg.VALOR_SEGURO_VIDA as valor_seguros,
	mg.VALOR_FUNDO_COMUM as valor_fc,
	mg.VALOR_TAXA_ADMINISTRACAO as valor_tx,
	mg.SEGURO_VIDA as seguro_vida,
	mg.SEGURO_QUEBRA as seguro_quebra,
	mg.SEGURO_DESEMP as seguro_desemp,
	mg.SEGURO_CONS as seguro_cons,
	format(mg.DATA_LANCAMENTO,'dd/MM/yyyy', 'en-US') as lancamento,
	format(mg.DATA_PAGAMENTO_COMISSAO,'dd/MM/yyyy', 'en-US') as data_pag_comissao,
	usi.NOME as usuario_inclusao,
	format(mg.AUD_DATA_INCLUSAO,'dd/MM/yyyy', 'en-US') as data_inclusao,
	usa.NOME as usuario_alteracao,	
	format(mg.AUD_DATA_ALTERACAO,'dd/MM/yyyy', 'en-US') as data_alteracao,
	mg.CODIGO_FILIAL_FISCAL as filial_fiscal,
	mg.STATUS as 'status',
	mg.PE_TA_IDEAL as pe_ta_ideal,
	mg.PE_TA as pe_ta,
	mg.VALOR_MULTA as valor_multa,
	mg.VALOR_JUROS as valor_juros
from MOVIMENTOS_GRUPOS mg 
	left join MOTIVOS_ESTORNOS me on mg.CODIGO_MOTIVO_ESTORNO = me.CODIGO_MOTIVO_ESTORNO
	left join BENS b on mg.CODIGO_BEM = b.CODIGO_BEM
	left join USUARIOS us on mg.CODIGO_USUARIO = us.CODIGO_USUARIO
	left join TIPOS_MOVIMENTOS tm on mg.CODIGO_TIPO_MOVIMENTO = tm.CODIGO_TIPO_MOVIMENTO
	left join CODIGOS_MOVIMENTOS cm on mg.CODIGO_MOVIMENTO = cm.CODIGO_MOVIMENTO
	left join cotas ct on mg.ID_Cota_Pagamento = ct.ID_COTA
	left join USUARIOS usa on mg.AUD_CODIGO_USUARIO_ALTERACAO = usa.CODIGO_USUARIO
	left join USUARIOS usi on mg.AUD_CODIGO_USUARIO_INCLUSAO = usi.CODIGO_USUARIO
where 
	mg.codigo_grupo = ${grupo} and mg.CODIGO_COTA = ${cota} and mg.versao = ${versao}
  and mg.CODIGO_MOVIMENTO in (${codigosSql})
`,
  );
  return result;
};

ConsultasDAO.prototype.codigosMovimentosFinanceirosCota = async function (req) {
  let grupo = req.query.grupo;
  let cota = req.query.cota;
  let versao = req.query.versao;
  let modeloExtrato = "";
  if (req.query.modeloExtrato == "sim") {
    modeloExtrato =
      "and cm.LISTA_EXTRATO = 'S' and mg.CODIGO_MOVIMENTO not in (580) and cm.LISTA_HISTORICO_EXTRATO = 'S'";
  }

  let result = await this._connection(
    `
    select 
      mg.CODIGO_MOVIMENTO as codigo,
      cm.DESCRICAO as descricao
    from MOVIMENTOS_GRUPOS mg inner join CODIGOS_MOVIMENTOS cm
    on mg.CODIGO_MOVIMENTO = cm.CODIGO_MOVIMENTO
    where mg.codigo_grupo = ${grupo} and mg.CODIGO_COTA = ${cota} and mg.versao = ${versao} 
      ${modeloExtrato}
    group by mg.CODIGO_MOVIMENTO,cm.DESCRICAO      
`,
  );
  return result;
};

ConsultasDAO.prototype.gruposAtivos = async function (req) {
  let result = await this._connection(
    `
    select CODIGO_GRUPO as grupo
    from grupos 
    where CODIGO_SITUACAO = 'A'      
`,
  );
  return result;
};

ConsultasDAO.prototype.telefonesCota = async function (req) {
  let doc = req.query.doc;
  let result = await this._connection(
    `
    select
      tc.DDD as ddd,
      tc.FONE_FAX as numero,
      tc.RAMAL as ramal,
      tt.DESCRICAO as tipo_de_contato  
    from TELEFONES_COTAS tc
    left join TIPOS_TELEFONES tt on tc.CODIGO_TIPO_TELEFONE = tt.DESCRICAO
    where tc.CGC_CPF_CLIENTE = '${doc}'      
`,
  );
  return result;
};

ConsultasDAO.prototype.proximasAssembleias = async function (req) {
  let num = req.query.num;
  let result = await this._connection(
    `
    WITH ProximaAssembleia AS (
      SELECT 
        a.CODIGO_GRUPO AS grupo,
        a.NUMERO_ASSEMBLEIA AS assembleia,
        format(a.DATA_VENCIMENTO,'dd/MM/yyyy') AS vencimento,
        format(a.DATA_SORTEIO,'dd/MM/yyyy') AS loteria,
        format(a.DATA_ASSEMBLEIA,'dd/MM/yyyy') AS data_assembleia,
        ROW_NUMBER() OVER (
          PARTITION BY a.CODIGO_GRUPO 
          ORDER BY a.DATA_ASSEMBLEIA ASC
        ) AS rn
      FROM ASSEMBLEIAS a
      INNER JOIN GRUPOS g ON a.CODIGO_GRUPO = g.CODIGO_GRUPO
      WHERE 
        g.CODIGO_SITUACAO = 'A'
        AND a.DATA_ASSEMBLEIA >= GETDATE()
    )
    SELECT 
      grupo,
      assembleia,
      vencimento,
      loteria,
      data_assembleia
    FROM ProximaAssembleia
    WHERE rn = ${num};     
`,
  );
  return result;
};

ConsultasDAO.prototype.relatorioValoresDevolver = async function (req) {
  let grupos = req.query.grupos;
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let versao = req.query.versao;
  const codigosGrupos = grupos?.split(",").filter((e) => e);
  const gruposSql = codigosGrupos.map((cod) => `${cod}`).join(",");

  if (versao == "detalhado") {
    let result = await this._connection(
      `
    select 
      ct.CODIGO_GRUPO as grupo,
      ct.CODIGO_COTA as cota,
      ct.VERSAO as 'versão',
      cl.nome as nome,
      format(ct.DATA_ADESAO,'dd/MM/yyyy', 'en-US') as 'adesão',
      ct.PERCENTUAL_IDEAL_DEVIDO as '% fc Pago',
      format(ct.VALOR_FUNDO_COMUM,'C','pt-BR') as 'valor fc pago',
      ct.CODIGO_SITUACAO as 'situação',
      format(ValorBem.PRECO_TABELA,'C','pt-BR') as 'crédito Atual',
      format(((ct.PERCENTUAL_IDEAL_DEVIDO / 100.0) * ValorBem.PRECO_TABELA * 0.90), 'C', 'pt-BR') AS [valor devolução]
      from cotas ct
      OUTER APPLY (
          SELECT TOP 1 preco_tabela 
          FROM REAJUSTES_BENS rb
          WHERE ct.codigo_bem = rb.CODIGO_BEM 
          ORDER BY DATA_REAJUSTE DESC
      ) as ValorBem
      left join clientes cl on ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE
      left join COTAS_CONTEMPLADAS_CANCELADAS ccc on ct.ID_COTA = ccc.ID_COTA
      where 
        ccc.DATA_CONTEMPLACAO is null
        and ct.CODIGO_SITUACAO not like 'E01'
        and ct.VERSAO between 1 and 39  
        and ct.CODIGO_GRUPO in (${gruposSql})
        and ct.DATA_ADESAO between '${data_inicial}' and '${data_final}'
        AND ((ct.PERCENTUAL_IDEAL_DEVIDO / 100.0) * ValorBem.PRECO_TABELA * 0.90) > 0
      
`,
    );
    return result;
  } else if (versao == "agrupado") {
    let resultAgrupado = await this._connection(
      `
    SELECT
  YEAR(ct.DATA_ADESAO) AS ano,
  ct.CODIGO_GRUPO AS grupo,
  COUNT(*) AS 'Qt. Cotas',
  FORMAT(
    SUM((ct.PERCENTUAL_IDEAL_DEVIDO / 100.0) * ValorBem.PRECO_TABELA * 0.90),
    'C', 'pt-BR'
  ) AS 'valor devolução'

FROM cotas ct
OUTER APPLY (
    SELECT TOP 1 preco_tabela
    FROM REAJUSTES_BENS rb
    WHERE ct.codigo_bem = rb.CODIGO_BEM
    ORDER BY DATA_REAJUSTE DESC
) AS ValorBem
LEFT JOIN clientes cl ON ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE
LEFT JOIN COTAS_CONTEMPLADAS_CANCELADAS ccc ON ct.ID_COTA = ccc.ID_COTA
WHERE
  ccc.DATA_CONTEMPLACAO IS NULL
  AND ct.CODIGO_SITUACAO NOT LIKE 'E01'
  AND ct.VERSAO BETWEEN 1 AND 39
  AND ct.CODIGO_GRUPO IN (${gruposSql})
  AND ct.DATA_ADESAO BETWEEN '${data_inicial}' AND '${data_final}'
  AND ((ct.PERCENTUAL_IDEAL_DEVIDO / 100.0) * ValorBem.PRECO_TABELA * 0.90) > 0
GROUP BY
  YEAR(ct.DATA_ADESAO),
  ct.CODIGO_GRUPO
ORDER BY
  YEAR(ct.DATA_ADESAO),
  ct.CODIGO_GRUPO;
`,
    );
    return resultAgrupado;
  }
};

ConsultasDAO.prototype.listaCotasContempladasComRedutor = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let grupos = req.query.grupos;
  const codigosGrupos = grupos?.split(",").filter((e) => e);
  const gruposSql = codigosGrupos.map((cod) => `${cod}`).join(",");

  let result = await this._connection(
    `
    select 
concat(ct.CODIGO_GRUPO,' - ',ct.CODIGO_COTA,'/',ct.VERSAO) as Cota,
pce.Parcela as 'Última Parcela',
round(pce.Percentual,4) as Percentual,
round(pce.[Perc. Pago],4) as 'Perc. Pago',
CONCAT(
        cast(round(pce.Percentual - pce.[Perc. Pago], 4) as varchar(20)), -- O valor numérico
        ' - (',
        cast(round(
            ABS( -- Pega o valor absoluto (sem sinal de menos) para a exibição
                ((pce.Percentual - pce.[Perc. Pago]) - penultimaParcela.PERCENTUAL_NORMAL) 
                / NULLIF(penultimaParcela.PERCENTUAL_NORMAL, 0) -- Evita divisão por zero
            ) * 100
        , 2) as varchar(20)),
        '% ',
        CASE 
            WHEN (pce.Percentual - pce.[Perc. Pago]) >= penultimaParcela.PERCENTUAL_NORMAL THEN 'MAIOR'
            ELSE 'MENOR'
        END,
        ' que a parcela ',
		penultimaParcela.parcela,
		' - ',
		round(penultimaParcela.PERCENTUAL_NORMAL,4),
		')'
    ) as 'Perc. Aberto + % de diferença com a parcela anterior',
pagBem.[Pagamentos de bem]
from cotas ct inner join GRUPOS gp
on ct.codigo_grupo = gp.codigo_grupo
outer apply (
		select 
			top 1 pce.PERCENTUAL_NORMAL as Percentual,
			ce.PARCELA as Parcela,
			pce.PERCENTUAL_PAGO as 'Perc. Pago'
		from COBRANCAS_ESPECIAIS ce inner join PERC_COBRANCAS_ESPECIAIS pce
		on ce.CODIGO_COBRANCA_ESPECIAL = pce.CODIGO_COBRANCA_ESPECIAL
		where pce.PERCENTUAL_NORMAL > 5 
		and ct.CODIGO_GRUPO = ce.CODIGO_GRUPO 
		and ct.CODIGO_COTA = ce.CODIGO_COTA
		and ct.VERSAO = ce.VERSAO
		and pce.TIPO = 'FC'
) as pce
outer apply (
		select count(*) as 'Pagamentos de bem'
		from MOVIMENTOS_GRUPOS mg 
		where ct.CODIGO_GRUPO = mg.CODIGO_GRUPO 
		and ct.CODIGO_COTA = mg.CODIGO_COTA 
		and ct.VERSAO = mg.VERSAO
		and CODIGO_MOVIMENTO = 350
		and AVISO_ESTORNO = 0
		AND mg.DATA_PAGAMENTO BETWEEN '${data_inicial}' AND '${data_final}'
) as pagBem
outer apply (
		select pce2.percentual_normal,
				ce2.PARCELA
		from COBRANCAS_ESPECIAIS ce2 inner join PERC_COBRANCAS_ESPECIAIS pce2
		on ce2.CODIGO_COBRANCA_ESPECIAL = pce2.CODIGO_COBRANCA_ESPECIAL
		where ce2.parcela = pce.Parcela -1
		and ct.CODIGO_GRUPO = ce2.CODIGO_GRUPO 
		and ct.CODIGO_COTA = ce2.CODIGO_COTA
		and ct.VERSAO = ce2.VERSAO
		and pce2.TIPO = 'FC'
) as penultimaParcela
where DATA_CONTEMPLACAO is not null 
	and ct.CODIGO_SITUACAO like 'N%'
	and gp.CODIGO_SITUACAO not like 'Y'
	and pce.Percentual is not null
	and pce.Percentual - pce.[Perc. Pago] > 0
	and ct.CODIGO_GRUPO in (${gruposSql})
	AND EXISTS (
        SELECT 1 
        FROM MOVIMENTOS_GRUPOS mg_filtro
        WHERE mg_filtro.CODIGO_GRUPO = ct.CODIGO_GRUPO
          AND mg_filtro.CODIGO_COTA = ct.CODIGO_COTA
          AND mg_filtro.VERSAO = ct.VERSAO
          AND mg_filtro.DATA_PAGAMENTO BETWEEN '${data_inicial}' AND '${data_final}'
          AND mg_filtro.CODIGO_MOVIMENTO = 350
    )
order by Cota
      
`,
  );
  return result;
};

ConsultasDAO.prototype.cotasContempladasSemEntregaParcAtraso = async function (
  req,
) {
  let grupos = req.query.grupos;
  const codigosGrupos = grupos?.split(",").filter((e) => e);
  const gruposSql = codigosGrupos.map((cod) => `${cod}`).join(",");
  const filtroAtrasadas =
    req.query.atrasadas == "apenasAtrasadas"
      ? "and parcelasAtraso.qtd_parcelas_atraso > 0"
      : "";

  let result = await this._connection(`SELECT 
    ct.CODIGO_GRUPO AS Grupo,
    ct.CODIGO_COTA  AS Cota,
    ct.VERSAO       AS [Versão],
    cl.NOME         AS Nome,
    ct.CODIGO_SITUACAO as [Situação],
    parcelasAtraso.qtd_parcelas_atraso as [Parcelas em atraso]
FROM cotas ct
INNER JOIN clientes cl
    ON ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE
   AND ct.tipo = cl.tipo
OUTER APPLY (
    SELECT COUNT(*) AS qtd_parcelas_atraso
    FROM NewconPlus.dbo.LZ_vw_Consorciado_Financeiro vw
    WHERE vw.Grupo  = ct.CODIGO_GRUPO
      AND vw.Cota   = ct.CODIGO_COTA
      AND vw.Versao = ct.VERSAO
      AND CAST(vw.Data_Vencimento AS DATE) < CAST(GETDATE() AS DATE)
      AND vw.Data_Pagamento IS NULL
) parcelasAtraso
WHERE ct.codigo_grupo IN (${gruposSql})
  AND ct.VERSAO = 0
  AND ct.DATA_CONTEMPLACAO IS NOT NULL
  AND ct.CODIGO_SITUACAO NOT LIKE '%Q%'
  AND ct.DATA_ENTREGA_BEM IS NULL
  ${filtroAtrasadas}
ORDER BY 
    ct.CODIGO_GRUPO,
    ct.CODIGO_COTA,
    ct.VERSAO;
`);
  return result;
};

ConsultasDAO.prototype.cotasPagasAtrasoSemMultaJuros = async function (req) {
  let data_inicial = req.query.data_inicial;
  let data_final = req.query.data_final;
  let filtroContemplacao = req.query.filtroContemplacao;
  let result = await this._connection(`select mg.CODIGO_GRUPO as Grupo,
	mg.codigo_cota as Cota, 
	mg.VERSAO as Versao, 
	cl.Nome,
	us.nome as 'Usuario que gerou' ,
	usa.NOME as 'Usuario que alterou',	
	case
		when ct.DATA_CONTEMPLACAO is null 
		then 'NÃO CONTEMPLADO'
		WHEN ct.DATA_CONTEMPLACAO is not null
		THEN 'CONTEMPLADO'
		END AS 'CONTEMPLAÇÃO',
	sc.NOMENCLATURA as 'SITUAÇÃO',
	format(DATA_PAGAMENTO, 'dd/MM/yyyy', 'en-us') as Pagamento,
	format(mg.DATA_VENCIMENTO, 'dd/MM/yyyy', 'en-us') as Vencimento,
	mg.VALOR_MULTA as Multa,
	mg.VALOR_JUROS as Juros
from MOVIMENTOS_GRUPOS mg left join cotas ct
on mg.CODIGO_GRUPO = ct.CODIGO_GRUPO and mg.CODIGO_COTA = ct.CODIGO_COTA and mg.VERSAO = ct.VERSAO
left join SITUACOES_COBRANCAS sc
        on ct.CODIGO_SITUACAO = sc.CODIGO_SITUACAO
left join CLIENTES cl on ct.CGC_CPF_CLIENTE = cl.CGC_CPF_CLIENTE and cl.tipo = ct.TIPO
left join COBRANCAS cb on mg.NUMERO_AVISO = cb.NUMERO_AVISO
left join USUARIOS us on cb.CODIGO_USUARIO = us.CODIGO_USUARIO
left join USUARIOS usa on cb.CODIGO_USUARIO_ALTERACAO = usa.CODIGO_USUARIO
where DATA_PAGAMENTO between '${data_inicial}' and '${data_final}' 
	and mg.DATA_VENCIMENTO < mg.DATA_PAGAMENTO 
	and mg.VALOR_JUROS = 0 
	and mg.VALOR_MULTA = 0
	and mg.CODIGO_MOVIMENTO = 10
	and mg.CODIGO_GRUPO < 70
	and ct.VERSAO = 0
	and cb.ABONA_MULTA = 'S'
  ${filtroContemplacao}`);

  return result;
};

ConsultasDAO.prototype.cotasCliente = async function (req) {
  let doc = req.query.doc;
  let result = await this._connection(
    `SELECT 
    ct.CODIGO_GRUPO AS grupo,
    ct.CODIGO_COTA AS cota,
    ct.VERSAO AS versao,
	tg.DESCRICAO as seguimento,
    ct.CGC_CPF_CLIENTE AS doc,
    FORMAT(ct.DATA_ADESAO, 'dd/MM/yyyy', 'en-US') AS adesao,
    CASE
        WHEN ct.DATA_CONTEMPLACAO IS NULL AND ccc.DATA_CONTEMPLACAO IS NULL THEN 'NÃO CONTEMPLADO'
        WHEN ct.DATA_CONTEMPLACAO IS NOT NULL OR ccc.DATA_CONTEMPLACAO IS NOT NULL THEN 'CONTEMPLADO'
    END AS contemplacao,
    FORMAT(((((100 - ct.PERCENTUAL_IDEAL_DEVIDO) + (ct.PERCENTUAL_TAXA_ADMINISTRACAO - ct.TAXA_ADMINISTRACAO_PAGA)) * ValorBem.PRECO_TABELA) / 100), 'C', 'pt-br') AS saldo_devedor_fc_tx,
    FORMAT(ValorBem.PRECO_TABELA, 'C', 'pt-br') AS credito_atual,
	SC.DESCRICAO AS situacao,
    -- Contagem de parcelas em aberto (status = 'N')
    SUM(CASE WHEN ce.STATUS_PARCELA = 'N' AND ce.CODIGO_MOVIMENTO = 10 THEN 1 ELSE 0 END) AS parcelas_abertas,

    -- Contagem de parcelas em pagamento (status = 'P')
    SUM(CASE WHEN ce.STATUS_PARCELA = 'P' AND ce.CODIGO_MOVIMENTO = 10 THEN 1 ELSE 0 END) AS parcelas_pagas

FROM 
    cotas ct 
LEFT JOIN 
    COTAS_CONTEMPLADAS_CANCELADAS ccc ON ccc.ID_COTA = ct.ID_COTA
OUTER APPLY (
    SELECT TOP 1 preco_tabela 
    FROM REAJUSTES_BENS rb
    WHERE ct.codigo_bem = rb.CODIGO_BEM 
    ORDER BY DATA_REAJUSTE DESC
) AS ValorBem
LEFT JOIN 
    COBRANCAS_ESPECIAIS ce ON ct.CODIGO_GRUPO = ce.CODIGO_GRUPO 
                           AND ct.CODIGO_COTA = ce.CODIGO_COTA 
                           AND ct.VERSAO = ce.VERSAO
LEFT join SITUACOES_COBRANCAS sc
          on ct.CODIGO_SITUACAO = sc.CODIGO_SITUACAO
Left join GRUPOS gp
		  on gp.CODIGO_GRUPO = ct.CODIGO_GRUPO
left join TIPOS_GRUPOS tg
		  on gp.CODIGO_TIPO_GRUPO = tg.CODIGO_TIPO_GRUPO	
WHERE 
    ct.CGC_CPF_CLIENTE = '${doc}'
GROUP BY 
    ct.CODIGO_GRUPO,
    ct.CODIGO_COTA,
    ct.VERSAO,
	tg.DESCRICAO,
    ct.CGC_CPF_CLIENTE,
    ct.DATA_ADESAO,
    ct.DATA_CONTEMPLACAO,
    ccc.DATA_CONTEMPLACAO,
    ct.PERCENTUAL_IDEAL_DEVIDO,
    ct.PERCENTUAL_TAXA_ADMINISTRACAO,
    ct.TAXA_ADMINISTRACAO_PAGA,
    ValorBem.PRECO_TABELA,
	sc.DESCRICAO
ORDER BY 
    ct.CODIGO_GRUPO, ct.CODIGO_COTA, ct.VERSAO
`,
  );
  return result;
};

ConsultasDAO.prototype.alienacao = async function (req) {
  let grupo = req.query.grupo;
  let cota = req.query.cota;
  let versao = req.query.versao;

  let result = await this._connection(
    `select
	fr.NOME 'Forma de Recebimento',
	tpb.DESCRICAO as 'Tipo de Pagamento',
	co.DESCRICAO_BEM as 'Bem Alienado',
	fc.NOME as Fornecedor,
	format(co.VALOR_BEM, 'C', 'pt-BR') as 'Valor do Bem',
	co.MARCA as Marca,
	co.MODELO as Modelo,
	co.COR as Cor,
	co.ANO_MODELO as 'Ano/Modelo',
	co.CHASSI as Chassi,
	co.PLACA as Placa,
	co.NOTA_FISCAL as 'Nota Fiscal',
	format(co.DATA_NOTA_FISCAL, 'dd/MM/yyyy', 'en-US') as 'Dt. Nota Fiscal',
	format(co.VALOR_NOTA_FISCAL, 'C', 'pt-BR') as 'Valor Nota Fiscal',
	co.OBSERVACOES as Observacoes,
	format(co.DATA_LIBERACAO, 'dd/MM/yyyy', 'en-US') as 'Dt. da Liberação',
	co.NUMERO_RECIBO as 'Numero do Recibo',
	co.NUMERO_CERTIFICADO as 'Numero do Certificado',
	case
		when co.SITUACAO_ALIENACAO = 'A' then 'ALIENADO'
		when co.SITUACAO_ALIENACAO = 'S' then 'SUBSTITUIDO'
		when co.SITUACAO_ALIENACAO = 'D' then 'DESALIENADO'
		else 'INDEFINIDO'
	end as 'Situação da Alienação',
	co.CODIGO_RENAVAM as 'Renavam',
	co.CODIGO_CONTROLE_SUBSTITUIDO as Substituido,
	format(co.DATA_REVISAO_DOCUMENTOS, 'dd/MM/yyyy', 'en-US') as 'Dt. Revisão Documentos',
	tc.DESCRICAO as Combustivel,
	case 
		when co.procedencia = 'N' then 'NOVO'
		when co.procedencia = 'U' then 'USADO'
		Else 'INDEFINIDO'
	End as Procedencia,
	co.CGC_CPF_FAVORECIDO as 'Doc. Favorecido',
	co.FAVORECIDO as Favorecido,
	co.NUMERO_CONTA_CORRENTE as 'Conta Corrente',
	co.NUMERO_AGENCIA as Agencia,
	format(co.VALOR_QUITACAO_PARCELAS,'C','pt-BR') as 'Valor Quitação Parcelas',
	fb.DESCRICAO as Fabricante,
	concat(co.CODIGO_BANCO,' - ',b.NOME_REDUZIDO) as Banco,
	co.NUMERO_PROGRAMACAO as 'Nº Programação',
	rep.NOME as 'Representante Favorecido',
	case
		when co.IMOVEL_TIPO = 1 then 'RESIDENCIAL'
		when co.IMOVEL_TIPO = 2 then 'COMERCIAL'
		when co.IMOVEL_TIPO = 3 then 'RURAL'
		else 'INDEFINIDO'
	end as 'Tipo de Imóvel',
	case
		when co.IMOVEL_CATEGORIA = 1 then 'NOVO'
		when co.IMOVEL_CATEGORIA = 2 then 'USADO'
		when co.IMOVEL_CATEGORIA = 3 then 'TERRENO'
		when co.IMOVEL_CATEGORIA = 4 then 'CONSTRUÇÃO'
		else 'INDEFINIDO'
	end as 'Categoria',
	format(co.IMOVEL_VALOR_COMPRA_VENDA, 'C', 'pt-BR') as 'Valor Compra/Venda',
	format(co.IMOVEL_VALOR_AVALIACAO, 'C', 'pt-BR') as 'Valor Avaliação',
	co.IMOVEL_LOGRADOURO as Endereco,
	co.IMOVEL_COMPLEMENTO as Complemento,
	co.IMOVEL_NUMERO as Numero,
	co.IMOVEL_BAIRRO as Bairro,
	cid.NOME AS Cidade,
  cid.ESTADO as Estado, 
	co.IMOVEL_CEP as Cep,
	co.IMOVEL_ESCRITURA_OFICIO as 'Escritura Oficio',
	co.IMOVEL_ESCRITURA_LIVRO as 'Escritura Livro',
	co.IMOVEL_ESCRITURA_FOLHA as 'Escritura Folha',
	concat(cide.NOME,' - ',cide.ESTADO) as 'Escritura Comarca',
	co.IMOVEL_REGISTRO_MATRICULA as 'Registro Matricula',
	co.IMOVEL_REGISTRO as 'Registro',
	co.IMOVEL_REGISTRO_OFICIO as 'Registro Oficio',
	co.IMOVEL_REGISTRO_PROCESSO as 'Registro Processo',
	co.IMOVEL_REGISTRO_LIVRO as 'Registro Livro',
	co.IMOVEL_REGISTRO_FOLHA as 'Registro Folha',
	co.FAVORECIDO_ENDERECO as 'Endereco Favorecido',
	co.FAVORECIDO_BAIRRO as 'Bairro Favorecido',
	cidf.NOME AS 'Cidade Favorecido', 
	co.FAVORECIDO_CEP as 'Cep Favorecido',
	co.FAVORECIDO_TELEFONE as 'Tel. Favorecido',
	format(co.FAVORECIDO_DATA_NASCIMENTO, 'dd/MM/yyyy', 'en-US') as 'Dt. Nasc. Favorecido',
	cidl.NOME as 'Cidade Licenciamento',
	format(co.DATA_DESALIENACAO, 'dd/MM/yyyy', 'en-US') as 'Dt. Desalienação',
	co.NUMERO_AUTORIZACAO as 'Nº Autorização',
	co.DIGITO_AGENCIA as 'Digito Agencia',
	co.DIGITO_CONTA_CORRENTE as 'Digito Conta Corrente',
	format(co.IMOVEL_REGISTRO_DATA,'dd/MM/yyyy','en-US') as 'Dt. Registro do Imovel',
	co.IMOVEL_REGISTRO_OBS_REGISTRO as 'Obs. Registro Imovel',
	format(co.IMOVEL_ESCRITURA_DATA,'dd/MM/yyyy','en-US') as 'Dt. Escritura Imovel',
	co.IMOVEL_ESCRITURA_OBS_ESCRITURA as 'Obs. Escritura Imovel',
	co.IMOVEL_ESCRITURA_OBS_TITULO as 'Obs. Escritura Titulo',
	case
		when co.IMOVEL_GARANTIA = 'P' then 'PRINCIPAL'
		else 'INDEFINIDO'
	end as 'Garantia Imovel',
	case
		when co.IMOVEL_GARANTIA_TIPO = 'H' then 'HIPOTECA'
		when co.IMOVEL_GARANTIA_TIPO = 'F' then 'FIDUCIA'
		else 'INDEFINIDO'
	end as 'Tipo Garantia Imovel',
	format(co.IMOVEL_GARANTIA_DATA, 'dd/MM/yyyy','pt-BR') as 'Dt. Garantia Imovel',
	format(co.DATA_ALIENACAO,'dd/MM/yyyy','pt-BR') as 'Dt. Alienação',
	format(co.DATA_SUBSTITUICAO,'dd/MM/yyyy','pt-BR') as 'Dt. Substituição',
	co.UF_PLACA as 'UF Placa',
	co.NUMERO_GRAVAME as 'Nº Gravame',
  hpb.DESCRICAO as Historico,
	af.NOME_REDUZIDO as 'Agente Financeiro',
  us.NOME as 'Usuario Pagamento'
from CONTROLES_OPCOES co left join cotas ct
	on co.codigo_grupo = ct.codigo_grupo and co.codigo_cota = ct.codigo_cota and co.VERSAO = ct.VERSAO
	left join FORMAS_RECEBIMENTOS fr
	on co.FORMA_PAGAMENTO = fr.FORMA_RECEBIMENTO
	left join TIPOS_PAGAMENTOS_BENS tpb
	on tpb.CODIGO_TIPO_PAGAMENTO = co.CODIGO_TIPO_PAGAMENTO
	left join FORNECEDORES fc
	on co.CODIGO_FORNECEDOR = fc.CODIGO_FORNECEDOR
	left join TIPOS_COMBUSTIVEL tc
	on co.COMBUSTIVEL = tc.CODIGO_TIPO_COMBUSTIVEL
	left join FABRICANTES fb
	on fb.CODIGO_FABRICANTE = co.CODIGO_FABRICANTE
	left join bancos b
	on b.codigo_banco = co.codigo_banco
	left join REPRESENTANTES rep
	on rep.codigo_representante = co.CODIGO_FAVORECIDO_REPR
	left join CIDADES cid
	on co.IMOVEL_MUNICIPIO = cid.CODIGO_CIDADE
	left join CIDADES cidf
	on co.FAVORECIDO_CIDADE = cidf.CODIGO_CIDADE
	left join CIDADES cidl
	on co.CODIGO_CIDADE_LICENCIAMENTO = cidl.CODIGO_CIDADE
  left join HISTORICOS_PAGAMENTOS_BENS hpb
	on hpb.CODIGO_HISTORICO = co.CODIGO_HISTORICO
  left join AGENTES_FINANCEIROS af
	on co.CODIGO_AGENTE = af.CODIGO_AGENTE
  left join USUARIOS us
	on us.CODIGO_USUARIO = co.CODIGO_USUARIO_PAGAMENTO
  left join CIDADES cide
	on cide.CODIGO_CIDADE = co.IMOVEL_ESCRITURA_COMARCA
where ct.CODIGO_GRUPO = ${grupo} and ct.codigo_cota = ${cota}	and ct.VERSAO = ${versao}
`,
  );
  return result;
};

ConsultasDAO.prototype.fasesProcessoAlienacao = async function (req) {
  let grupo = req.query.grupo;
  let cota = req.query.cota;
  let versao = req.query.versao;

  let result = await this._connection(
    `
        SELECT 
      us.NOME as 'Usuario Cadastro',
      format(fp.DATA_OCORRENCIA, 'dd/MM/yyyy', 'en-US') as 'Dt. Ocorrencia',
      CONCAT(fp.CODIGO_FASE, ' - ', dp.DESCRICAO) as 'Fase do Processo'
    FROM FASES_PROCESSOS FP
      LEFT JOIN DEF_PROCESSOS DP
      ON FP.CODIGO_FASE = DP.CODIGO_FASE
      left join USUARIOS us
      on fp.CODIGO_USUARIO = us.CODIGO_USUARIO
    WHERE codigo_grupo = ${grupo} and CODIGO_COTA = ${cota} and VERSAO = ${versao}
    order by FP.DATA_OCORRENCIA desc
`,
  );
  return result;
};

module.exports = function () {
  return ConsultasDAO;
};
