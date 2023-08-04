function ConsultasDAO(connection){
	this._connection = connection;
};

ConsultasDAO.prototype.getTeste = async function(){
    var result = await this._connection(`select distinct 
                                            ct.CODIGO_GRUPO as GRUPO
                                            ,ct.CODIGO_COTA as COTA
                                            ,ct.VERSAO AS VS
                                            ,format(mg.DATA_PAGAMENTO,'dd/MM/yyyy', 'en-US') AS DT_PAG
                                            ,mg.VALOR_TAXA_ADMINISTRACAO AS VL_TX_ADM
                                            ,mg.VALOR_BEM AS VL_BEM
                                            ,(mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) as NUM_PAR
                                            ,ct.CODIGO_TABELA_COMISSAO AS COD_TAB_COM
                                            ,QUANTIDADE_PARCELAS.NUMERO_PARCELAS_MAXIMO AS MAX_COM
                                            ,RP.CODIGO_EQUIPE AS COD_EQ
                                            ,nivel1.NUMERO_PARCELA AS N1_NUM_PAR
                                            ,nivel1.CODIGO_REPRESENTANTE AS N1_COD
                                            ,nivel1.DESCRICAO
                                            ,nivel1.PERC_COMISSAO as PERC_COM
                                            ,case
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' THEN nivel1.PERC_COMISSAO*PP.VALOR_BEM/100
                                            else nivel1.PERC_COMISSAO*mg.VALOR_BEM/100
                                            end as VAL_N1
                                            ,nivel2.CODIGO_REPRESENTANTE AS N2_COD
                                            ,nivel2.DESCRICAO
                                            ,nivel2.PERC_COMISSAO as PERC_COM
                                            ,case
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' THEN nivel2.PERC_COMISSAO*PP.VALOR_BEM/100
                                            else nivel2.PERC_COMISSAO*mg.VALOR_BEM/100
                                            end as VAL_N2
                                            ,nivel3.CODIGO_REPRESENTANTE AS N3_COD
                                            ,nivel3.DESCRICAO
                                            ,nivel3.PERC_COMISSAO as PERC_COM
                                            ,case
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' THEN nivel3.PERC_COMISSAO*PP.VALOR_BEM/100
                                            else nivel3.PERC_COMISSAO*mg.VALOR_BEM/100
                                            end as VAL_N3
                                            ,nivel4.CODIGO_REPRESENTANTE AS N4_COD
                                            ,nivel4.DESCRICAO
                                            ,nivel4.PERC_COMISSAO as PERC_COM
                                            ,case
                                            when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' THEN nivel4.PERC_COMISSAO*PP.VALOR_BEM/100
                                            else nivel4.PERC_COMISSAO*mg.VALOR_BEM/100
                                            end as VAL_N4
                                            ,ct.CODIGO_REPRESENTANTE
                                            ,format(ct.DATA_VENDA, 'dd/MM/yyyy', 'en-US') as DATA_VENDA
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
                                                outer apply
                                                    (
                                                        select 
                                                            SUM(pp.VALOR_BEM) as total 
                                                        from 
                                                            PROPOSTAS pp 
                                                        where 
                                                            pp.DATA_VENDA between pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL 
                                                            and pp.CODIGO_REPRESENTANTE = ct.CODIGO_REPRESENTANTE
                                                    ) as TOTAL_VENDAS
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
                                                    from 
                                                    COMISSOES_CATEGORIAS cc 
                                                    where 
                                                    cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                                    and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
                                                    and case when RP.CODIGO_CATEGORIA IS NULL THEN RP.CODIGO_CATEGORIA_SUPERVISAO ELSE RP.CODIGO_CATEGORIA END = CC.CODIGO_CATEGORIA
                                                    ) as nivel1
                                                    outer apply
                                                    (select rp2.CODIGO_REPRESENTANTE, rp2.CODIGO_ENCARREGADO, rp2.CODIGO_CATEGORIA, rp2.CODIGO_CATEGORIA_SUPERVISAO from REPRESENTANTES rp2 where rp2.CODIGO_REPRESENTANTE = rp.CODIGO_ENCARREGADO) as rep2
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
                                                    ,cr.DESCRICAO 
                                                    from 
                                                    COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
                                                    cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
                                                    where 
                                                    cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                                    and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
                                                    and case when rep2.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep2.CODIGO_CATEGORIA ELSE rep2.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
                                                    ) as nivel2
                                                    outer apply
                                                    (select rp3.CODIGO_REPRESENTANTE, rp3.CODIGO_ENCARREGADO, rp3.CODIGO_CATEGORIA, rp3.CODIGO_CATEGORIA_SUPERVISAO from REPRESENTANTES rp3 where rp3.CODIGO_REPRESENTANTE = rep2.CODIGO_ENCARREGADO) as rep3
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
                                                    ,cr.DESCRICAO 
                                                    from 
                                                    COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
                                                    cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
                                                    where 
                                                    cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                                    and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
                                                    and case when rep3.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep3.CODIGO_CATEGORIA ELSE Rep3.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
                                                    ) as nivel3
                                                    outer apply
                                                    (select rp4.CODIGO_REPRESENTANTE, rp4.CODIGO_ENCARREGADO, rp4.CODIGO_CATEGORIA, rp4.CODIGO_CATEGORIA_SUPERVISAO from REPRESENTANTES rp4 where rp4.CODIGO_REPRESENTANTE = rep3.CODIGO_ENCARREGADO) as rep4
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
                                                    ,cr.DESCRICAO 
                                                    from 
                                                    COMISSOES_CATEGORIAS cc inner join CATEGORIAS_REPRESENTANTES cr on
                                                    cc.CODIGO_CATEGORIA = cr.CODIGO_CATEGORIA
                                                    where 
                                                    cc.CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO
                                                    and cc.NUMERO_PARCELA = (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1)
                                                    and case when rep4.CODIGO_CATEGORIA_SUPERVISAO IS NULL THEN rep4.CODIGO_CATEGORIA ELSE Rep4.CODIGO_CATEGORIA_SUPERVISAO END = CC.CODIGO_CATEGORIA
                                                    ) as nivel4
                                                    outer apply
                                                    (select max(NUMERO_PARCELA) as NUMERO_PARCELAS_MAXIMO from COMISSOES_CATEGORIAS where NUMERO_PARCELA < 500 AND CODIGO_TABELA_COMISSAO = ct.CODIGO_TABELA_COMISSAO) as QUANTIDADE_PARCELAS
                                            
                                            where
                                                --ct.CODIGO_GRUPO = '65'
                                                --and ct.CODIGO_COTA = '127'
                                                --and ct.VERSAO = '00'
                                                mg.CODIGO_MOVIMENTO in ('010','011')
                                                and ct.VERSAO < '40'
                                                and mg.DATA_CONTABILIZACAO between '20230103' and '20230201'
                                                and ct.DATA_VENDA between /*'20230103' and '20230117'*/ pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL
                                                and (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) <= QUANTIDADE_PARCELAS.NUMERO_PARCELAS_MAXIMO
                                            order by
                                                ct.CODIGO_GRUPO
                                                ,ct.CODIGO_COTA
                                                ,ct.VERSAO`)
                                
    return result
};

module.exports = function(){
    return ConsultasDAO;
};