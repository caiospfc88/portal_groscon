function ConsultasDAO(connection){
	this._connection = connection;
};

ConsultasDAO.prototype.getComissoesSemReducao = async function(){
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

ConsultasDAO.prototype.getComissoesComReducao = async function(){
    var result = await this._connection(`select
                                            ct.CODIGO_GRUPO as GRUPO
                                            ,ct.CODIGO_COTA as COTA
                                            ,ct.VERSAO AS VS
                                            ,mg.DATA_PAGAMENTO AS DT_PAG
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
                                            ,Perc_reduz.PERCENTUAL_NORMAL
                                            ,case
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN format(nivel1.PERC_COMISSAO*PP.VALOR_BEM/100, 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN FORMAT(nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.90)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.80)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.70)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.60)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((pp.VALOR_BEM*0.50)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN format(nivel1.PERC_COMISSAO*mg.VALOR_BEM/100, 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 and nivel1.CODIGO_REPRESENTANTE not IN (2288,2171,2291,2290) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100), 'N', 'pt-br')
                                                else format(nivel1.PERC_COMISSAO*mg.VALOR_BEM/100, 'N', 'pt-br')
                                            end as VAL_N1
                                            ,nivel2.CODIGO_REPRESENTANTE AS N2_COD
                                            ,nivel2.DESCRICAO
                                            ,nivel2.PERC_COMISSAO as PERC_COM
                                            ,case
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN format(nivel2.PERC_COMISSAO*PP.VALOR_BEM/100, 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.90)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.80)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.70)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.60)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((pp.VALOR_BEM*0.50)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN format(nivel2.PERC_COMISSAO*mg.VALOR_BEM/100, 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 and nivel2.CODIGO_REPRESENTANTE not IN (902,909,910,914) THEN format(nivel2.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100), 'N', 'pt-br')
                                                else format(nivel2.PERC_COMISSAO*mg.VALOR_BEM/100, 'N', 'pt-br')
                                            end as VAL_N2
                                            ,nivel3.CODIGO_REPRESENTANTE AS N3_COD
                                            ,nivel3.DESCRICAO
                                            ,nivel3.PERC_COMISSAO as PERC_COM
                                            ,case
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN format(nivel3.PERC_COMISSAO*PP.VALOR_BEM/100, 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 and nivel3.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.90)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 and nivel3.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.80)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 and nivel3.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.70)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 and nivel3.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.60)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 and nivel3.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel3.PERC_COMISSAO*((pp.VALOR_BEM*0.50)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN format(nivel1.PERC_COMISSAO*mg.VALOR_BEM/100, 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 and nivel1.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 and nivel1.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 and nivel1.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 and nivel1.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 and nivel1.CODIGO_REPRESENTANTE not IN (912) THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100), 'N', 'pt-br')
                                                else format(nivel3.PERC_COMISSAO*mg.VALOR_BEM/100, 'N', 'pt-br')
                                            end as VAL_N3
                                            ,nivel4.CODIGO_REPRESENTANTE AS N4_COD
                                            ,nivel4.DESCRICAO
                                            ,nivel4.PERC_COMISSAO as PERC_COM
                                            ,case
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN format(nivel4.PERC_COMISSAO*PP.VALOR_BEM/100, 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN format(nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.90)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN format(nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.80)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN format(nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.70)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN format(nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.60)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) = 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN format(nivel4.PERC_COMISSAO*((pp.VALOR_BEM*0.50)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL < 10 THEN format(nivel1.PERC_COMISSAO*mg.VALOR_BEM/100, 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 10 and 20 THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.90)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 20 and 30 THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.80)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 30 and 40 THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.70)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL between 40 and 50 THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.60)/100), 'N', 'pt-br')
                                                when (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) > 1 AND MG.CODIGO_MOVIMENTO = '010' and Perc_reduz.PERCENTUAL_NORMAL > 50 THEN format(nivel1.PERC_COMISSAO*((mg.VALOR_BEM*0.50)/100), 'N', 'pt-br')
                                                else format(nivel4.PERC_COMISSAO*mg.VALOR_BEM/100, 'N', 'pt-br')
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
                                                pc.CODIGO_PERIODO = rp.CODIGO_PERIODO
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
                                            --ct.CODIGO_GRUPO = '056'
                                            --and ct.CODIGO_COTA = '281'
                                            --and ct.VERSAO = '00' and
                                            mg.CODIGO_MOVIMENTO in ('010','011')
                                            and ct.VERSAO < '40'
                                            and mg.DATA_CONTABILIZACAO between '20220701' and '20220801'
                                            and ct.DATA_VENDA between pc.DATA_CONTABILIZACAO_INICIAL and pc.DATA_CONTABILIZACAO_FINAL
                                            and (mg.NUMERO_ASSEMBLEIA - ct.NUMERO_ASSEMBLEIA_EMISSAO + 1) <= QUANTIDADE_PARCELAS.NUMERO_PARCELAS_MAXIMO
                                        order by
                                            ct.CODIGO_GRUPO
                                            ,ct.CODIGO_COTA
                                            ,ct.VERSAO`)
                                
    return result
};

ConsultasDAO.prototype.getQuitados = async function(){
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
                                            and ct.DATA_SITUACAO between '20220801' and '20220831'
                                            and a.QTD_SIT is null`)
    return result
};    

ConsultasDAO.prototype.getAniversariantesMesAtual = async function(){
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
                                            where month(data_nascimento) = month(GETDATE()) and g.CODIGO_SITUACAO = 'A' and ct.VERSAO = 00 and PESSOA = 'F' and sc.CODIGO_SITUACAO like 'N%%'
                                            order by ct.CODIGO_GRUPO,ct.CODIGO_COTA`)
    return result
};

ConsultasDAO.prototype.getRelatorioRenegociacoes = async function(){
    var result = await this._connection(`select
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
                                                    AND DATA_PAGAMENTO BETWEEN '20230101' AND '20230131'
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
                                                    AND DATA_PAGAMENTO BETWEEN '20230101' AND '20230131'
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
                                                    AND PT.DATA_ALTERACAO BETWEEN '20230101' AND '20230131'
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
                                                    AND DATA_PAGAMENTO BETWEEN '20230101' AND '20230131'
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
                                                    AND DATA_PAGAMENTO BETWEEN '20230101' AND '20230131'
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
                                            ,ct.VERSAO`)
    return result
};

ConsultasDAO.prototype.getRelatorioAproveitamento = async function(){
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
                                        where ct.DATA_VENDA BETWEEN '20221101' AND '20230430' --and rep.CODIGO_EQUIPE = 107
                                        order by rep.CODIGO_REPRESENTANTE `)
                                           
    var result2 = await this._connection(`SELECT rep.CODIGO_REPRESENTANTE AS 'REPRESENTANTE',
                                            CT.CODIGO_SITUACAO as 'SITUAÇÃO',
                                            COUNT(CODIGO_SITUACAO) AS QUANTIDADE,
                                            sum(pp.VALOR_BEM) as 'TOTAL VALOR'
                                        from COTAS ct 
                                        inner join REPRESENTANTES rep 
                                        on ct.CODIGO_REPRESENTANTE = rep.CODIGO_REPRESENTANTE
                                        inner join PROPOSTAS pp
                                        on ct.CODIGO_GRUPO = pp.CODIGO_GRUPO and ct.CODIGO_COTA = pp.CODIGO_COTA and ct.VERSAO = pp.VERSAO
                                        where ct.DATA_VENDA BETWEEN '20221101' AND '20230430' --and rep.CODIGO_EQUIPE = 107
                                        GROUP BY ct.CODIGO_SITUACAO, rep.CODIGO_REPRESENTANTE
                                        order by rep.CODIGO_REPRESENTANTE`)
    var result = result1.concat(result2);
    return result
};

module.exports = function(){
    return ConsultasDAO;
};