/**
 * FinData Architecture - Script Interativo Vanilla JavaScript
 * Responsável por: Menu Mobile, Smooth Scroll, Inspetor de Tabelas,
 * Playground com 15 Queries SQL, Cópia de Código e Validação de Formulário.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ========================================================
  // 1. Dados Estruturais das 10 Tabelas do Banco de Dados
  // ========================================================
  const databaseSchema = {
    instituicoes_financeiras: {
      name: 'instituicoes_financeiras',
      module: 'Módulo 1: Domínio & Lookup',
      desc: 'Cadastro de bancos emissores dos CDBs, corretoras de custódia e distribuidoras parceiras.',
      columns: [
        { name: 'id_instituicao', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador único autoincremental da instituição.' },
        { name: 'nome_instituicao', type: 'VARCHAR(100)', key: '-', nullable: 'Não', desc: 'Razão social ou nome fantasia da corretora/banco emissor.' },
        { name: 'cnpj', type: 'VARCHAR(14)', key: 'UNIQUE', nullable: 'Não', desc: 'CNPJ oficial com 14 dígitos, sem pontuação, unívoco.' },
        { name: 'tipo_instituicao', type: "ENUM('Banco Emissor','Corretora','Distribuidora')", key: '-', nullable: 'Não', desc: 'Classificação funcional da instituição no ecossistema.' },
        { name: 'codigo_compe', type: 'VARCHAR(5)', key: '-', nullable: 'Sim', desc: 'Código de compensação bancária no BACEN (ex: 001, 237, 341).' }
      ]
    },
    tipos_ativos: {
      name: 'tipos_ativos',
      module: 'Módulo 1: Domínio & Lookup',
      desc: 'Taxonomia dos instrumentos financeiros suportados pelo portfólio.',
      columns: [
        { name: 'id_tipo_ativo', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador único do tipo de ativo financeiro.' },
        { name: 'nome_tipo', type: 'VARCHAR(50)', key: '-', nullable: 'Não', desc: 'Denominação do instrumento (ex: Ação Ordinária, CDB Pós, Tesouro Selic).' },
        { name: 'classe_ativo', type: "ENUM('Renda Fixa','Renda Variavel','Fundo de Investimento')", key: '-', nullable: 'Não', desc: 'Macroclasse financeira para fins de alocação de risco.' },
        { name: 'descricao', type: 'VARCHAR(255)', key: '-', nullable: 'Sim', desc: 'Nota explicativa dos atributos e riscos do tipo de título.' }
      ]
    },
    carteiras_investimento: {
      name: 'carteiras_investimento',
      module: 'Módulo 2: Core do Modelo',
      desc: 'Divisão dos excedentes da empresa por objetivos estratégicos de liquidez e risco.',
      columns: [
        { name: 'id_carteira', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador único da carteira gerencial.' },
        { name: 'nome_carteira', type: 'VARCHAR(100)', key: '-', nullable: 'Não', desc: 'Nome da carteira (ex: Reserva de Emergência, Aposentadoria, Oportunidade).' },
        { name: 'objetivo', type: 'VARCHAR(255)', key: '-', nullable: 'Sim', desc: 'Declaração formal de propósito de investimento e perfil.' },
        { name: 'data_criacao', type: 'DATE', key: '-', nullable: 'Não', desc: 'Data de inauguração contábil da carteira.' }
      ]
    },
    ativos_financeiros: {
      name: 'ativos_financeiros',
      module: 'Módulo 2: Core do Modelo',
      desc: 'Cadastro detalhado de cada título, papel ou ação custodiada.',
      columns: [
        { name: 'id_ativo_financeiro', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador único do ativo cadastrado.' },
        { name: 'id_tipo_ativo', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira vinculada a tipos_ativos.id_tipo_ativo.' },
        { name: 'id_instituicao_emissora', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira vinculada a instituicoes_financeiras.id_instituicao.' },
        { name: 'ticker_codigo', type: 'VARCHAR(30)', key: 'INDEX', nullable: 'Não', desc: 'Símbolo na B3 ou código de emissão do papel (ex: PETR4, CDB_INTER_104).' },
        { name: 'nome_ativo', type: 'VARCHAR(150)', key: '-', nullable: 'Não', desc: 'Nome formal comercial do título de investimento.' },
        { name: 'indexador_taxa', type: 'VARCHAR(50)', key: '-', nullable: 'Sim', desc: 'Fórmula de rendimento (ex: 104% do CDI, Selic + 0.5%, IPCA + 6.2%).' },
        { name: 'data_emissao', type: 'DATE', key: '-', nullable: 'Sim', desc: 'Data de subscrição ou emissão original do título.' },
        { name: 'data_vencimento', type: 'DATE', key: '-', nullable: 'Sim', desc: 'Data final de vencimento do papel (NULL para Ações perpétuas).' },
        { name: 'liquidez', type: "ENUM('Diaria','No Vencimento','D+1','D+30')", key: '-', nullable: 'Não', desc: 'Regra estrita de conversibilidade em caixa.' }
      ]
    },
    transacoes_investimento: {
      name: 'transacoes_investimento',
      module: 'Módulo 3: Operacional & Eventos',
      desc: 'Log imutável de transações financeiras (ordens de compra, venda, aportes e resgates).',
      columns: [
        { name: 'id_transacao', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador sequencial único da transação executada.' },
        { name: 'id_carteira', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira para carteiras_investimento.' },
        { name: 'id_ativo_financeiro', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira para ativos_financeiros.' },
        { name: 'id_corretora', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira para a corretora executante em instituicoes_financeiras.' },
        { name: 'tipo_operacao', type: "ENUM('Compra','Venda','Aporte','Resgate')", key: '-', nullable: 'Não', desc: 'Natureza contábil da movimentação.' },
        { name: 'data_transacao', type: 'DATE', key: '-', nullable: 'Não', desc: 'Data efetiva da execução no pregão/emissor.' },
        { name: 'quantidade', type: 'DECIMAL(15,4)', key: '-', nullable: 'Não', desc: 'Volume de papéis transacionados.' },
        { name: 'preco_unitario', type: 'DECIMAL(15,4)', key: '-', nullable: 'Não', desc: 'Preço unitário em reais praticado na operação.' },
        { name: 'valor_total_bruto', type: 'DECIMAL(15,2)', key: '-', nullable: 'Não', desc: 'Total financeiro bruto movimentado (Qtd x Preço).' }
      ]
    },
    proventos_recebidos: {
      name: 'proventos_recebidos',
      module: 'Módulo 3: Operacional & Eventos',
      desc: 'Entradas de renda passiva (Dividendos, JCP, Rendimentos) com cálculo de IR retido.',
      columns: [
        { name: 'id_provento', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador único do crédito de provento.' },
        { name: 'id_carteira', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira da carteira beneficiária.' },
        { name: 'id_ativo_financeiro', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira do papel que originou o pagamento.' },
        { name: 'tipo_provento', type: "ENUM('Dividendo','JCP','Rendimento','Amortizacao')", key: '-', nullable: 'Não', desc: 'Natureza do provento (Dividendos isentos, JCP com 15% IR).' },
        { name: 'data_com', type: 'DATE', key: '-', nullable: 'Não', desc: 'Data de corte para direito ao recebimento.' },
        { name: 'data_pagamento', type: 'DATE', key: '-', nullable: 'Não', desc: 'Data de crédito efetivo na conta da corretora.' },
        { name: 'valor_bruto_recebido', type: 'DECIMAL(15,2)', key: '-', nullable: 'Não', desc: 'Montante total bruto anunciado.' },
        { name: 'imposto_renda_retido', type: 'DECIMAL(15,2)', key: '-', nullable: 'Não', desc: 'Retenção tributária retida na fonte pagadora.' },
        { name: 'valor_liquido_creditado', type: 'DECIMAL(15,2)', key: '-', nullable: 'Não', desc: 'Valor líquido financeiro integrado à carteira.' }
      ]
    },
    custos_tributacao: {
      name: 'custos_tributacao',
      module: 'Módulo 3: Operacional & Eventos',
      desc: 'Taxas, corretagens e impostos descontados de operações e resgates.',
      columns: [
        { name: 'id_custo', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador do lançamento do custo operacional.' },
        { name: 'id_transacao', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira vinculada à transação geradora do encargo.' },
        { name: 'tipo_custo', type: "ENUM('Corretagem','Emolumentos_B3','Taxa_Custodia','IRRF','IOF')", key: '-', nullable: 'Não', desc: 'Classificação da dedução financeira.' },
        { name: 'aliquota_aplicada_pct', type: 'DECIMAL(5,2)', key: '-', nullable: 'Sim', desc: 'Alíquota percentual aplicada (ex: 22.5%, 15.0%).' },
        { name: 'valor_deduzido_reais', type: 'DECIMAL(15,2)', key: '-', nullable: 'Não', desc: 'Valor debitado em moeda corrente (R$).' },
        { name: 'data_cobranca', type: 'DATE', key: '-', nullable: 'Não', desc: 'Data contábil da liquidação do débito.' }
      ]
    },
    historico_cotacoes_taxas: {
      name: 'historico_cotacoes_taxas',
      module: 'Módulo 4: Mercado, Histórico & Gerencial',
      desc: 'Série temporal diária de preços de abertura, fechamento e taxas contratadas.',
      columns: [
        { name: 'id_historico', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador do registro histórico diário.' },
        { name: 'id_ativo_financeiro', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira vinculada a ativos_financeiros.' },
        { name: 'data_referencia', type: 'DATE', key: 'INDEX', nullable: 'Não', desc: 'Data do pregão ou do fechamento bancário.' },
        { name: 'preco_abertura', type: 'DECIMAL(15,4)', key: '-', nullable: 'Sim', desc: 'Cotação de abertura na B3 (se aplicável).' },
        { name: 'preco_fechamento', type: 'DECIMAL(15,4)', key: '-', nullable: 'Não', desc: 'Preço de fechamento utilizado na marcação a mercado.' },
        { name: 'taxa_anual_pactuada_pct', type: 'DECIMAL(8,4)', key: '-', nullable: 'Sim', desc: 'Taxa anualizada de juros vigente para títulos pós/pré-fixados.' }
      ]
    },
    indices_benchmarks: {
      name: 'indices_benchmarks',
      module: 'Módulo 4: Mercado, Histórico & Gerencial',
      desc: 'Histórico dos principais indexadores econômicos para cálculo de rentabilidade real.',
      columns: [
        { name: 'id_indice', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador do registro do índice econômico.' },
        { name: 'nome_indice', type: 'VARCHAR(50)', key: 'INDEX', nullable: 'Não', desc: 'Nome do benchmark (ex: SELIC, CDI, IPCA, IBOVESPA).' },
        { name: 'data_apuracao', type: 'DATE', key: 'INDEX', nullable: 'Não', desc: 'Data oficial da divulgação pelo Banco Central ou B3.' },
        { name: 'valor_taxa_diaria_pct', type: 'DECIMAL(8,4)', key: '-', nullable: 'Não', desc: 'Variação percentual apurada no dia útil.' },
        { name: 'valor_acumulado_ano_pct', type: 'DECIMAL(8,4)', key: '-', nullable: 'Não', desc: 'Taxa percentual acumulada no ano civil corrente (YTD).' }
      ]
    },
    posicao_consolidada_diaria: {
      name: 'posicao_consolidada_diaria',
      module: 'Módulo 4: Mercado, Histórico & Gerencial',
      desc: 'Snapshot diário da carteira: saldo em custódia, preço médio, valor a mercado e rentabilidade.',
      columns: [
        { name: 'id_posicao', type: 'INT', key: 'PK', nullable: 'Não', desc: 'Identificador sequencial único do snapshot de fechamento.' },
        { name: 'id_carteira', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira vinculada a carteiras_investimento.' },
        { name: 'id_ativo_financeiro', type: 'INT', key: 'FK', nullable: 'Não', desc: 'Chave estrangeira vinculada a ativos_financeiros.' },
        { name: 'data_posicao', type: 'DATE', key: 'INDEX', nullable: 'Não', desc: 'Data do encerramento da posição patrimonial.' },
        { name: 'quantidade_saldo', type: 'DECIMAL(15,4)', key: '-', nullable: 'Não', desc: 'Total de cotas/ações em custódia na data.' },
        { name: 'custo_medio_unitario', type: 'DECIMAL(15,4)', key: '-', nullable: 'Não', desc: 'Preço médio ponderado de aquisição (D-0).' },
        { name: 'valor_investido_total', type: 'DECIMAL(15,2)', key: '-', nullable: 'Não', desc: 'Capital aportado acumulado (Saldo x Custo Médio).' },
        { name: 'valor_mercado_total', type: 'DECIMAL(15,2)', key: '-', nullable: 'Não', desc: 'Patrimônio a mercado na data (Saldo x Cotação Diária).' },
        { name: 'lucro_prejuizo_acumulado', type: 'DECIMAL(15,2)', key: '-', nullable: 'Não', desc: 'Ganho ou perda nominal acumulada em reais.' },
        { name: 'rentabilidade_pct_acumulada', type: 'DECIMAL(8,4)', key: '-', nullable: 'Não', desc: 'Retorno acumulado sobre o capital investido (% ROI).' }
      ]
    }
  };

  // ========================================================
  // 2. Catálogo Completo das 15 Queries SQL com Saídas Simuladas
  // ========================================================
  const queriesCatalog = {
    1: {
      id: 1,
      filename: 'query_01_patrimonio_carteiras.sql',
      headline: 'Agrupamento de Patrimônio Total por Carteira (GROUP BY + SUM)',
      purpose: 'Totaliza o capital investido e a valoração a mercado de cada carteira de investimentos no fechamento diário, computando o lucro nominal consolidado.',
      time: '14.2ms • 3 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    c.id_carteira,
    c.nome_carteira,
    <span class="sql-fn">COUNT</span>(p.id_ativo_financeiro) <span class="sql-kw">AS</span> total_ativos,
    <span class="sql-fn">SUM</span>(p.valor_investido_total) <span class="sql-kw">AS</span> total_investido,
    <span class="sql-fn">SUM</span>(p.valor_mercado_total)   <span class="sql-kw">AS</span> total_patrimonio,
    <span class="sql-fn">ROUND</span>(<span class="sql-fn">SUM</span>(p.lucro_prejuizo_acumulado), <span class="sql-num">2</span>) <span class="sql-kw">AS</span> lucro_acumulado_reais
<span class="sql-kw">FROM</span> carteiras_investimento c
<span class="sql-kw">INNER JOIN</span> posicao_consolidada_diaria p 
    <span class="sql-kw">ON</span> c.id_carteira = p.id_carteira
<span class="sql-kw">WHERE</span> p.data_posicao = <span class="sql-str">'2026-10-15'</span>
<span class="sql-kw">GROUP BY</span> c.id_carteira, c.nome_carteira
<span class="sql-kw">ORDER BY</span> total_patrimonio <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    c.id_carteira,
    c.nome_carteira,
    COUNT(p.id_ativo_financeiro) AS total_ativos,
    SUM(p.valor_investido_total) AS total_investido,
    SUM(p.valor_mercado_total) AS total_patrimonio,
    ROUND(SUM(p.lucro_prejuizo_acumulado), 2) AS lucro_acumulado_reais
FROM carteiras_investimento c
INNER JOIN posicao_consolidada_diaria p ON c.id_carteira = p.id_carteira
WHERE p.data_posicao = '2026-10-15'
GROUP BY c.id_carteira, c.nome_carteira
ORDER BY total_patrimonio DESC;`,
      headers: ['id_carteira', 'nome_carteira', 'total_ativos', 'total_investido (R$)', 'total_patrimonio (R$)', 'lucro_acumulado (R$)'],
      rows: [
        ['1', 'Reserva de Emergência', '1', '145.000,00', '148.500,00', '+3.500,00'],
        ['2', 'Aposentadoria', '2', '6.985,00', '7.290,00', '+305,00'],
        ['3', 'Geração de Renda', '1', '5.115,00', '5.255,00', '+140,00']
      ]
    },
    2: {
      id: 2,
      filename: 'query_02_proventos_liquidos.sql',
      headline: 'Relatório de Proventos Líquidos com Retenção (INNER JOIN + BETWEEN)',
      purpose: 'Audita o recebimento de dividendos e JCP no período, calculando o valor bruto anunciado, o imposto retido e o crédito líquido em conta.',
      time: '18.6ms • 4 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    pr.id_provento,
    c.nome_carteira,
    a.ticker_codigo,
    pr.tipo_provento,
    pr.data_pagamento,
    pr.valor_bruto_recebido,
    pr.imposto_renda_retido,
    pr.valor_liquido_creditado
<span class="sql-kw">FROM</span> proventos_recebidos pr
<span class="sql-kw">INNER JOIN</span> carteiras_investimento c 
    <span class="sql-kw">ON</span> pr.id_carteira = c.id_carteira
<span class="sql-kw">INNER JOIN</span> ativos_financeiros a 
    <span class="sql-kw">ON</span> pr.id_ativo_financeiro = a.id_ativo_financeiro
<span class="sql-kw">WHERE</span> pr.data_pagamento <span class="sql-kw">BETWEEN</span> <span class="sql-str">'2026-01-01'</span> <span class="sql-kw">AND</span> <span class="sql-str">'2026-10-31'</span>
<span class="sql-kw">ORDER BY</span> pr.data_pagamento <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    pr.id_provento,
    c.nome_carteira,
    a.ticker_codigo,
    pr.tipo_provento,
    pr.data_pagamento,
    pr.valor_bruto_recebido,
    pr.imposto_renda_retido,
    pr.valor_liquido_creditado
FROM proventos_recebidos pr
INNER JOIN carteiras_investimento c ON pr.id_carteira = c.id_carteira
INNER JOIN ativos_financeiros a ON pr.id_ativo_financeiro = a.id_ativo_financeiro
WHERE pr.data_pagamento BETWEEN '2026-01-01' AND '2026-10-31'
ORDER BY pr.data_pagamento DESC;`,
      headers: ['id_provento', 'nome_carteira', 'ticker_codigo', 'tipo_provento', 'data_pagamento', 'bruto (R$)', 'ir_retido (R$)', 'liquido (R$)'],
      rows: [
        ['104', 'Geração de Renda', 'MXRF11', 'Rendimento', '2026-10-14', '420,00', '0,00', '+420,00'],
        ['103', 'Aposentadoria', 'VALE3', 'JCP', '2026-09-20', '350,00', '52,50', '+297,50'],
        ['102', 'Aposentadoria', 'PETR4', 'Dividendo', '2026-08-15', '600,00', '0,00', '+600,00'],
        ['101', 'Geração de Renda', 'BBAS3', 'JCP', '2026-06-30', '180,00', '27,00', '+153,00']
      ]
    },
    3: {
      id: 3,
      filename: 'query_03_filtro_lucro_having.sql',
      headline: 'Filtragem de Carteiras com Lucro > R$ 200,00 (HAVING)',
      purpose: 'Identifica exclusivamente as carteiras de investimento cuja soma consolidada do lucro acumulado supere o teto mínimo de R$ 200,00 na data apurada.',
      time: '11.4ms • 2 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    c.id_carteira,
    c.nome_carteira,
    <span class="sql-fn">SUM</span>(p.valor_mercado_total) <span class="sql-kw">AS</span> patrimonio_atual,
    <span class="sql-fn">SUM</span>(p.lucro_prejuizo_acumulado) <span class="sql-kw">AS</span> lucro_total_reais,
    <span class="sql-fn">ROUND</span>(<span class="sql-fn">AVG</span>(p.rentabilidade_pct_acumulada), <span class="sql-num">2</span>) <span class="sql-kw">AS</span> rentabilidade_media_pct
<span class="sql-kw">FROM</span> carteiras_investimento c
<span class="sql-kw">INNER JOIN</span> posicao_consolidada_diaria p 
    <span class="sql-kw">ON</span> c.id_carteira = p.id_carteira
<span class="sql-kw">WHERE</span> p.data_posicao = <span class="sql-str">'2026-10-15'</span>
<span class="sql-kw">GROUP BY</span> c.id_carteira, c.nome_carteira
<span class="sql-kw">HAVING</span> lucro_total_reais > <span class="sql-num">200.00</span>
<span class="sql-kw">ORDER BY</span> lucro_total_reais <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    c.id_carteira,
    c.nome_carteira,
    SUM(p.valor_mercado_total) AS patrimonio_atual,
    SUM(p.lucro_prejuizo_acumulado) AS lucro_total_reais,
    ROUND(AVG(p.rentabilidade_pct_acumulada), 2) AS rentabilidade_media_pct
FROM carteiras_investimento c
INNER JOIN posicao_consolidada_diaria p ON c.id_carteira = p.id_carteira
WHERE p.data_posicao = '2026-10-15'
GROUP BY c.id_carteira, c.nome_carteira
HAVING lucro_total_reais > 200.00
ORDER BY lucro_total_reais DESC;`,
      headers: ['id_carteira', 'nome_carteira', 'patrimonio_atual (R$)', 'lucro_total (R$)', 'rentabilidade_media (%)'],
      rows: [
        ['1', 'Reserva de Emergência', '148.500,00', '+3.500,00', '2,41%'],
        ['2', 'Aposentadoria', '7.290,00', '+305,00', '6,38%']
      ]
    },
    4: {
      id: 4,
      filename: 'query_04_alfa_vs_selic.sql',
      headline: 'Comparativo de Alfa frente ao Benchmark Selic Anual',
      purpose: 'Cruza a rentabilidade anualizada pactuada dos títulos com a taxa Selic acumulada do último período, computando o spread sobre a renda fixa livre de risco.',
      time: '16.9ms • 3 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    a.ticker_codigo,
    a.nome_ativo,
    t.nome_tipo,
    h.taxa_anual_pactuada_pct <span class="sql-kw">AS</span> rentabilidade_ativo,
    b.valor_acumulado_ano_pct <span class="sql-kw">AS</span> selic_acumulada_ano,
    <span class="sql-fn">ROUND</span>(h.taxa_anual_pactuada_pct - b.valor_acumulado_ano_pct, <span class="sql-num">2</span>) <span class="sql-kw">AS</span> spread_alfa_pct
<span class="sql-kw">FROM</span> ativos_financeiros a
<span class="sql-kw">INNER JOIN</span> tipos_ativos t <span class="sql-kw">ON</span> a.id_tipo_ativo = t.id_tipo_ativo
<span class="sql-kw">INNER JOIN</span> historico_cotacoes_taxas h <span class="sql-kw">ON</span> a.id_ativo_financeiro = h.id_ativo_financeiro
<span class="sql-kw">CROSS JOIN</span> (
    <span class="sql-kw">SELECT</span> valor_acumulado_ano_pct 
    <span class="sql-kw">FROM</span> indices_benchmarks 
    <span class="sql-kw">WHERE</span> nome_indice = <span class="sql-str">'SELIC'</span> 
    <span class="sql-kw">ORDER BY</span> data_apuracao <span class="sql-kw">DESC LIMIT</span> <span class="sql-num">1</span>
) b
<span class="sql-kw">WHERE</span> h.data_referencia = <span class="sql-str">'2026-10-15'</span>
<span class="sql-kw">ORDER BY</span> spread_alfa_pct <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    a.ticker_codigo,
    a.nome_ativo,
    t.nome_tipo,
    h.taxa_anual_pactuada_pct AS rentabilidade_ativo,
    b.valor_acumulado_ano_pct AS selic_acumulada_ano,
    ROUND(h.taxa_anual_pactuada_pct - b.valor_acumulado_ano_pct, 2) AS spread_alfa_pct
FROM ativos_financeiros a
INNER JOIN tipos_ativos t ON a.id_tipo_ativo = t.id_tipo_ativo
INNER JOIN historico_cotacoes_taxas h ON a.id_ativo_financeiro = h.id_ativo_financeiro
CROSS JOIN (
    SELECT valor_acumulado_ano_pct 
    FROM indices_benchmarks 
    WHERE nome_indice = 'SELIC' 
    ORDER BY data_apuracao DESC LIMIT 1
) b
WHERE h.data_referencia = '2026-10-15'
ORDER BY spread_alfa_pct DESC;`,
      headers: ['ticker_codigo', 'nome_ativo', 'nome_tipo', 'taxa_ativo (%)', 'selic_ano (%)', 'spread_alfa (%)'],
      rows: [
        ['CDB_INTER_110', 'CDB Inter Pós-Fixado 110%', 'CDB Pós-Fixado', '11,85%', '10,75%', '+1,10%'],
        ['LC_C6_PRE', 'Letra de Câmbio C6 12%', 'Renda Fixa Pré', '12,00%', '10,75%', '+1,25%'],
        ['TESOURO_SELIC', 'Tesouro Direto Selic 2029', 'Tesouro Selic', '10,80%', '10,75%', '+0,05%']
      ]
    },
    5: {
      id: 5,
      filename: 'query_05_auditoria_tributaria.sql',
      headline: 'Auditoria de Custos Tributários e Deduções Operacionais',
      purpose: 'Rastreia todos os descontos tributários (IRRF, IOF e emolumentos B3) aplicados às transações financeiras por ordem decrescente de montante.',
      time: '15.3ms • 3 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    t.id_transacao,
    a.ticker_codigo,
    t.tipo_operacao,
    t.data_transacao,
    t.valor_total_bruto,
    ct.tipo_custo,
    ct.aliquota_aplicada_pct,
    ct.valor_deduzido_reais
<span class="sql-kw">FROM</span> transacoes_investimento t
<span class="sql-kw">INNER JOIN</span> ativos_financeiros a <span class="sql-kw">ON</span> t.id_ativo_financeiro = a.id_ativo_financeiro
<span class="sql-kw">INNER JOIN</span> custos_tributacao ct <span class="sql-kw">ON</span> t.id_transacao = ct.id_transacao
<span class="sql-kw">ORDER BY</span> t.data_transacao <span class="sql-kw">DESC</span>, ct.valor_deduzido_reais <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    t.id_transacao,
    a.ticker_codigo,
    t.tipo_operacao,
    t.data_transacao,
    t.valor_total_bruto,
    ct.tipo_custo,
    ct.aliquota_aplicada_pct,
    ct.valor_deduzido_reais
FROM transacoes_investimento t
INNER JOIN ativos_financeiros a ON t.id_ativo_financeiro = a.id_ativo_financeiro
INNER JOIN custos_tributacao ct ON t.id_transacao = ct.id_transacao
ORDER BY t.data_transacao DESC, ct.valor_deduzido_reais DESC;`,
      headers: ['id_transacao', 'ticker_codigo', 'operacao', 'data_transacao', 'valor_bruto (R$)', 'tipo_custo', 'aliquota (%)', 'deduzido (R$)'],
      rows: [
        ['52', 'CDB_ITAU_100', 'Resgate', '2026-10-10', '50.000,00', 'IRRF', '17,50%', '875,00'],
        ['48', 'PETR4', 'Compra', '2026-10-02', '1.625,00', 'Emolumentos_B3', '0,03%', '0,49'],
        ['45', 'CDB_SANTANDER', 'Resgate', '2026-09-18', '20.000,00', 'IOF', '4,00%', '80,00']
      ]
    },
    6: {
      id: 6,
      filename: 'query_06_exposicao_por_classe.sql',
      headline: 'Exposição Percentual por Classe de Ativo (Renda Fixa vs Variável)',
      purpose: 'Analisa o balanceamento da carteira corporativa, calculando o percentual alocado em Renda Fixa versus Renda Variável.',
      time: '13.1ms • 2 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    t.classe_ativo,
    <span class="sql-fn">COUNT</span>(<span class="sql-kw">DISTINCT</span> a.id_ativo_financeiro) <span class="sql-kw">AS</span> qtd_titulos,
    <span class="sql-fn">SUM</span>(p.valor_mercado_total) <span class="sql-kw">AS</span> total_alocado,
    <span class="sql-fn">ROUND</span>(<span class="sql-fn">SUM</span>(p.valor_mercado_total) * <span class="sql-num">100.0</span> / (
        <span class="sql-kw">SELECT</span> <span class="sql-fn">SUM</span>(valor_mercado_total) 
        <span class="sql-kw">FROM</span> posicao_consolidada_diaria 
        <span class="sql-kw">WHERE</span> data_posicao = <span class="sql-str">'2026-10-15'</span>
    ), <span class="sql-num">2</span>) <span class="sql-kw">AS</span> exposicao_pct
<span class="sql-kw">FROM</span> posicao_consolidada_diaria p
<span class="sql-kw">INNER JOIN</span> ativos_financeiros a <span class="sql-kw">ON</span> p.id_ativo_financeiro = a.id_ativo_financeiro
<span class="sql-kw">INNER JOIN</span> tipos_ativos t <span class="sql-kw">ON</span> a.id_tipo_ativo = t.id_tipo_ativo
<span class="sql-kw">WHERE</span> p.data_posicao = <span class="sql-str">'2026-10-15'</span>
<span class="sql-kw">GROUP BY</span> t.classe_ativo;`,
      rawSql: `SELECT 
    t.classe_ativo,
    COUNT(DISTINCT a.id_ativo_financeiro) AS qtd_titulos,
    SUM(p.valor_mercado_total) AS total_alocado,
    ROUND(SUM(p.valor_mercado_total) * 100.0 / (
        SELECT SUM(valor_mercado_total) 
        FROM posicao_consolidada_diaria 
        WHERE data_posicao = '2026-10-15'
    ), 2) AS exposicao_pct
FROM posicao_consolidada_diaria p
INNER JOIN ativos_financeiros a ON p.id_ativo_financeiro = a.id_ativo_financeiro
INNER JOIN tipos_ativos t ON a.id_tipo_ativo = t.id_tipo_ativo
WHERE p.data_posicao = '2026-10-15'
GROUP BY t.classe_ativo;`,
      headers: ['classe_ativo', 'qtd_titulos', 'total_alocado (R$)', 'exposicao (%)'],
      rows: [
        ['Renda Fixa', '3', '148.500,00', '91,64%'],
        ['Renda Variavel', '2', '12.545,00', '8,36%']
      ]
    },
    7: {
      id: 7,
      filename: 'query_07_risco_emissor_cdb.sql',
      headline: 'Análise de Risco de Crédito por Instituição Emissora (CDBs)',
      purpose: 'Verifica a concentração de capital por instituição financeira emissora para cumprimento do limite de garantia do FGC.',
      time: '14.5ms • 3 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    inst.nome_instituicao,
    inst.cnpj,
    <span class="sql-fn">COUNT</span>(a.id_ativo_financeiro) <span class="sql-kw">AS</span> total_cdbs_emitidos,
    <span class="sql-fn">SUM</span>(p.valor_mercado_total) <span class="sql-kw">AS</span> exposicao_total_reais,
    <span class="sql-kw">CASE WHEN</span> <span class="sql-fn">SUM</span>(p.valor_mercado_total) > <span class="sql-num">250000.00</span> 
        <span class="sql-kw">THEN</span> <span class="sql-str">'ALERTA: Acima teto FGC'</span> 
        <span class="sql-kw">ELSE</span> <span class="sql-str">'DENTRO DA COBERTURA FGC'</span> 
    <span class="sql-kw">END AS</span> status_fgc
<span class="sql-kw">FROM</span> instituicoes_financeiras inst
<span class="sql-kw">INNER JOIN</span> ativos_financeiros a <span class="sql-kw">ON</span> inst.id_instituicao = a.id_instituicao_emissora
<span class="sql-kw">INNER JOIN</span> posicao_consolidada_diaria p <span class="sql-kw">ON</span> a.id_ativo_financeiro = p.id_ativo_financeiro
<span class="sql-kw">WHERE</span> p.data_posicao = <span class="sql-str">'2026-10-15'</span>
<span class="sql-kw">GROUP BY</span> inst.nome_instituicao, inst.cnpj;`,
      rawSql: `SELECT 
    inst.nome_instituicao,
    inst.cnpj,
    COUNT(a.id_ativo_financeiro) AS total_cdbs_emitidos,
    SUM(p.valor_mercado_total) AS exposicao_total_reais,
    CASE WHEN SUM(p.valor_mercado_total) > 250000.00 
        THEN 'ALERTA: Acima teto FGC' 
        ELSE 'DENTRO DA COBERTURA FGC' 
    END AS status_fgc
FROM instituicoes_financeiras inst
INNER JOIN ativos_financeiros a ON inst.id_instituicao = a.id_instituicao_emissora
INNER JOIN posicao_consolidada_diaria p ON a.id_ativo_financeiro = p.id_ativo_financeiro
WHERE p.data_posicao = '2026-10-15'
GROUP BY inst.nome_instituicao, inst.cnpj;`,
      headers: ['nome_instituicao', 'cnpj', 'total_cdbs', 'exposicao (R$)', 'status_fgc'],
      rows: [
        ['Banco Inter S.A.', '00416968000101', '1', '148.500,00', 'DENTRO DA COBERTURA FGC'],
        ['Itaú Unibanco S.A.', '60701190000104', '1', '50.000,00', 'DENTRO DA COBERTURA FGC'],
        ['Banco BTG Pactual S.A.', '30306294000145', '1', '35.000,00', 'DENTRO DA COBERTURA FGC']
      ]
    },
    8: {
      id: 8,
      filename: 'query_08_cronograma_vencimentos.sql',
      headline: 'Cronograma de Vencimento de Títulos para Gestão de Caixa',
      purpose: 'Mapeia os papéis ordenados por proximidade de data de vencimento para provisionamento de reinvestimento.',
      time: '12.0ms • 3 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    a.ticker_codigo,
    a.nome_ativo,
    a.data_vencimento,
    <span class="sql-fn">DATEDIFF</span>(a.data_vencimento, <span class="sql-fn">CURDATE</span>()) <span class="sql-kw">AS</span> dias_ate_vencimento,
    a.liquidez,
    p.valor_mercado_total <span class="sql-kw">AS</span> montante_a_resgatar
<span class="sql-kw">FROM</span> ativos_financeiros a
<span class="sql-kw">INNER JOIN</span> posicao_consolidada_diaria p <span class="sql-kw">ON</span> a.id_ativo_financeiro = p.id_ativo_financeiro
<span class="sql-kw">WHERE</span> a.data_vencimento <span class="sql-kw">IS NOT NULL</span>
  <span class="sql-kw">AND</span> p.data_posicao = <span class="sql-str">'2026-10-15'</span>
<span class="sql-kw">ORDER BY</span> a.data_vencimento <span class="sql-kw">ASC</span>;`,
      rawSql: `SELECT 
    a.ticker_codigo,
    a.nome_ativo,
    a.data_vencimento,
    DATEDIFF(a.data_vencimento, CURDATE()) AS dias_ate_vencimento,
    a.liquidez,
    p.valor_mercado_total AS montante_a_resgatar
FROM ativos_financeiros a
INNER JOIN posicao_consolidada_diaria p ON a.id_ativo_financeiro = p.id_ativo_financeiro
WHERE a.data_vencimento IS NOT NULL
  AND p.data_posicao = '2026-10-15'
ORDER BY a.data_vencimento ASC;`,
      headers: ['ticker_codigo', 'nome_ativo', 'data_vencimento', 'dias_restantes', 'liquidez', 'montante (R$)'],
      rows: [
        ['CDB_INTER_104', 'CDB Inter Pós-Fixado 104%', '2026-12-15', '50', 'No Vencimento', '148.500,00'],
        ['LC_C6_PRE', 'Letra Câmbio C6 12% a.a.', '2027-04-20', '176', 'No Vencimento', '30.000,00'],
        ['TESOURO_SELIC_29', 'Tesouro Direto Selic 2029', '2029-03-01', '856', 'D+1', '45.000,00']
      ]
    },
    9: {
      id: 9,
      filename: 'query_09_preco_medio_vs_mercado.sql',
      headline: 'Preço Médio Ponderado vs Cotação Atual na B3',
      purpose: 'Compara o custo médio unitário histórico de aquisição contra o fechamento mais recente na B3 para apurar o delta de valor.',
      time: '13.8ms • 2 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    a.ticker_codigo,
    p.quantidade_saldo,
    p.custo_medio_unitario <span class="sql-kw">AS</span> preco_medio_compra,
    h.preco_fechamento <span class="sql-kw">AS</span> cotacao_atual_b3,
    <span class="sql-fn">ROUND</span>(h.preco_fechamento - p.custo_medio_unitario, <span class="sql-num">2</span>) <span class="sql-kw">AS</span> delta_unitario_reais,
    p.rentabilidade_pct_acumulada <span class="sql-kw">AS</span> rentabilidade_pct
<span class="sql-kw">FROM</span> posicao_consolidada_diaria p
<span class="sql-kw">INNER JOIN</span> ativos_financeiros a <span class="sql-kw">ON</span> p.id_ativo_financeiro = a.id_ativo_financeiro
<span class="sql-kw">INNER JOIN</span> historico_cotacoes_taxas h 
    <span class="sql-kw">ON</span> a.id_ativo_financeiro = h.id_ativo_financeiro 
   <span class="sql-kw">AND</span> p.data_posicao = h.data_referencia
<span class="sql-kw">WHERE</span> p.data_posicao = <span class="sql-str">'2026-10-15'</span>;`,
      rawSql: `SELECT 
    a.ticker_codigo,
    p.quantidade_saldo,
    p.custo_medio_unitario AS preco_medio_compra,
    h.preco_fechamento AS cotacao_atual_b3,
    ROUND(h.preco_fechamento - p.custo_medio_unitario, 2) AS delta_unitario_reais,
    p.rentabilidade_pct_acumulada AS rentabilidade_pct
FROM posicao_consolidada_diaria p
INNER JOIN ativos_financeiros a ON p.id_ativo_financeiro = a.id_ativo_financeiro
INNER JOIN historico_cotacoes_taxas h 
    ON a.id_ativo_financeiro = h.id_ativo_financeiro 
   AND p.data_posicao = h.data_referencia
WHERE p.data_posicao = '2026-10-15';`,
      headers: ['ticker_codigo', 'quantidade', 'preco_medio (R$)', 'fechamento_b3 (R$)', 'delta_unit (R$)', 'rentabilidade (%)'],
      rows: [
        ['PETR4', '50,0000', '32,50', '35,80', '+3,30', '10,15%'],
        ['VALE3', '50,0000', '102,30', '105,10', '+2,80', '2,74%']
      ]
    },
    10: {
      id: 10,
      filename: 'query_10_fluxo_dividendos_mensal.sql',
      headline: 'Fluxo Mensal de Dividendos Creditados por Carteira',
      purpose: 'Agrupa o volume de proventos líquidos por mês e ano para demonstração do fluxo de renda passiva da tesouraria.',
      time: '14.1ms • 3 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    <span class="sql-fn">DATE_FORMAT</span>(pr.data_pagamento, <span class="sql-str">'%Y-%m'</span>) <span class="sql-kw">AS</span> mes_competencia,
    c.nome_carteira,
    <span class="sql-fn">SUM</span>(pr.valor_bruto_recebido) <span class="sql-kw">AS</span> total_bruto,
    <span class="sql-fn">SUM</span>(pr.imposto_renda_retido) <span class="sql-kw">AS</span> total_ir_retido,
    <span class="sql-fn">SUM</span>(pr.valor_liquido_creditado) <span class="sql-kw">AS</span> proventos_liquidos
<span class="sql-kw">FROM</span> proventos_recebidos pr
<span class="sql-kw">INNER JOIN</span> carteiras_investimento c <span class="sql-kw">ON</span> pr.id_carteira = c.id_carteira
<span class="sql-kw">GROUP BY</span> mes_competencia, c.nome_carteira
<span class="sql-kw">ORDER BY</span> mes_competencia <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    DATE_FORMAT(pr.data_pagamento, '%Y-%m') AS mes_competencia,
    c.nome_carteira,
    SUM(pr.valor_bruto_recebido) AS total_bruto,
    SUM(pr.imposto_renda_retido) AS total_ir_retido,
    SUM(pr.valor_liquido_creditado) AS proventos_liquidos
FROM proventos_recebidos pr
INNER JOIN carteiras_investimento c ON pr.id_carteira = c.id_carteira
GROUP BY mes_competencia, c.nome_carteira
ORDER BY mes_competencia DESC;`,
      headers: ['mes_competencia', 'nome_carteira', 'total_bruto (R$)', 'ir_retido (R$)', 'liquido (R$)'],
      rows: [
        ['2026-10', 'Geração de Renda', '420,00', '0,00', '+420,00'],
        ['2026-09', 'Aposentadoria', '350,00', '52,50', '+297,50'],
        ['2026-08', 'Aposentadoria', '600,00', '0,00', '+600,00']
      ]
    },
    11: {
      id: 11,
      filename: 'query_11_ranking_volume_negociado.sql',
      headline: 'Ranking dos Ativos Mais Negociados por Volume Financeiro',
      purpose: 'Identifica os ativos com maior movimentação financeira na história operacional da empresa.',
      time: '12.7ms • 3 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    a.ticker_codigo,
    a.nome_ativo,
    <span class="sql-fn">COUNT</span>(t.id_transacao) <span class="sql-kw">AS</span> numero_operacoes,
    <span class="sql-fn">SUM</span>(t.valor_total_bruto) <span class="sql-kw">AS</span> volume_financeiro_total
<span class="sql-kw">FROM</span> transacoes_investimento t
<span class="sql-kw">INNER JOIN</span> ativos_financeiros a <span class="sql-kw">ON</span> t.id_ativo_financeiro = a.id_ativo_financeiro
<span class="sql-kw">GROUP BY</span> a.ticker_codigo, a.nome_ativo
<span class="sql-kw">ORDER BY</span> volume_financeiro_total <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    a.ticker_codigo,
    a.nome_ativo,
    COUNT(t.id_transacao) AS numero_operacoes,
    SUM(t.valor_total_bruto) AS volume_financeiro_total
FROM transacoes_investimento t
INNER JOIN ativos_financeiros a ON t.id_ativo_financeiro = a.id_ativo_financeiro
GROUP BY a.ticker_codigo, a.nome_ativo
ORDER BY volume_financeiro_total DESC;`,
      headers: ['ticker_codigo', 'nome_ativo', 'operacoes', 'volume_total (R$)'],
      rows: [
        ['CDB_INTER_104', 'CDB Inter Pós-Fixado 104%', '3', '145.000,00'],
        ['VALE3', 'Vale S.A. ON', '4', '15.345,00'],
        ['PETR4', 'Petrobras PN', '5', '8.125,00']
      ]
    },
    12: {
      id: 12,
      filename: 'query_12_aliquotas_regressivas_irrf.sql',
      headline: 'Transações com Incidência de Alíquota Regressiva de IRRF',
      purpose: 'Mapeia os resgates efetuados e audita se a alíquota aplicada respeitou a tabela regressiva da RFB (22.5% até 15%).',
      time: '14.9ms • 2 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    t.id_transacao,
    a.ticker_codigo,
    t.data_transacao <span class="sql-kw">AS</span> data_resgate,
    ct.aliquota_aplicada_pct <span class="sql-kw">AS</span> aliquota_ir_pct,
    ct.valor_deduzido_reais <span class="sql-kw">AS</span> valor_imposto_pago
<span class="sql-kw">FROM</span> transacoes_investimento t
<span class="sql-kw">INNER JOIN</span> ativos_financeiros a <span class="sql-kw">ON</span> t.id_ativo_financeiro = a.id_ativo_financeiro
<span class="sql-kw">INNER JOIN</span> custos_tributacao ct <span class="sql-kw">ON</span> t.id_transacao = ct.id_transacao
<span class="sql-kw">WHERE</span> t.tipo_operacao = <span class="sql-str">'Resgate'</span>
  <span class="sql-kw">AND</span> ct.tipo_custo = <span class="sql-str">'IRRF'</span>
<span class="sql-kw">ORDER BY</span> t.data_transacao <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    t.id_transacao,
    a.ticker_codigo,
    t.data_transacao AS data_resgate,
    ct.aliquota_aplicada_pct AS aliquota_ir_pct,
    ct.valor_deduzido_reais AS valor_imposto_pago
FROM transacoes_investimento t
INNER JOIN ativos_financeiros a ON t.id_ativo_financeiro = a.id_ativo_financeiro
INNER JOIN custos_tributacao ct ON t.id_transacao = ct.id_transacao
WHERE t.tipo_operacao = 'Resgate'
  AND ct.tipo_custo = 'IRRF'
ORDER BY t.data_transacao DESC;`,
      headers: ['id_transacao', 'ticker_codigo', 'data_resgate', 'aliquota_ir (%)', 'imposto_pago (R$)'],
      rows: [
        ['52', 'CDB_ITAU_100', '2026-10-10', '17,50%', '875,00'],
        ['31', 'CDB_BRADESCO_POS', '2026-05-14', '20,00%', '400,00']
      ]
    },
    13: {
      id: 13,
      filename: 'query_13_rentabilidade_reserva.sql',
      headline: 'Rentabilidade Diária Acumulada da Reserva de Emergência',
      purpose: 'Acompanha a evolução diária patrimonial da carteira de Reserva de Emergência nos últimos fechamentos registrados.',
      time: '11.8ms • 3 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    p.data_posicao,
    c.nome_carteira,
    p.valor_investido_total,
    p.valor_mercado_total,
    p.lucro_prejuizo_acumulado,
    p.rentabilidade_pct_acumulada
<span class="sql-kw">FROM</span> posicao_consolidada_diaria p
<span class="sql-kw">INNER JOIN</span> carteiras_investimento c <span class="sql-kw">ON</span> p.id_carteira = c.id_carteira
<span class="sql-kw">WHERE</span> c.nome_carteira = <span class="sql-str">'Reserva de Emergência'</span>
<span class="sql-kw">ORDER BY</span> p.data_posicao <span class="sql-kw">DESC LIMIT</span> <span class="sql-num">5</span>;`,
      rawSql: `SELECT 
    p.data_posicao,
    c.nome_carteira,
    p.valor_investido_total,
    p.valor_mercado_total,
    p.lucro_prejuizo_acumulado,
    p.rentabilidade_pct_acumulada
FROM posicao_consolidada_diaria p
INNER JOIN carteiras_investimento c ON p.id_carteira = c.id_carteira
WHERE c.nome_carteira = 'Reserva de Emergência'
ORDER BY p.data_posicao DESC LIMIT 5;`,
      headers: ['data_posicao', 'carteira', 'investido (R$)', 'a_mercado (R$)', 'lucro (R$)', 'rentabilidade (%)'],
      rows: [
        ['2026-10-16', 'Reserva de Emergência', '145.000,00', '148.560,00', '+3.560,00', '2,45%'],
        ['2026-10-15', 'Reserva de Emergência', '145.000,00', '148.500,00', '+3.500,00', '2,41%'],
        ['2026-10-14', 'Reserva de Emergência', '145.000,00', '148.440,00', '+3.440,00', '2,37%']
      ]
    },
    14: {
      id: 14,
      filename: 'query_14_balanco_custos_b3.sql',
      headline: 'Balanço Consolidado de Custos da B3 vs Lucro Líquido',
      purpose: 'Compara os emolumentos e taxas de corretagem pagos contra os lucros gerados para avaliar o custo de transação sobre o capital.',
      time: '15.6ms • 2 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    c.nome_carteira,
    <span class="sql-fn">SUM</span>(p.lucro_prejuizo_acumulado) <span class="sql-kw">AS</span> lucro_bruto_acumulado,
    <span class="sql-fn">COALESCE</span>(<span class="sql-fn">SUM</span>(ct.valor_deduzido_reais), <span class="sql-num">0</span>) <span class="sql-kw">AS</span> total_taxas_b3,
    <span class="sql-fn">ROUND</span>(<span class="sql-fn">SUM</span>(p.lucro_prejuizo_acumulado) - <span class="sql-fn">COALESCE</span>(<span class="sql-fn">SUM</span>(ct.valor_deduzido_reais), <span class="sql-num">0</span>), <span class="sql-num">2</span>) <span class="sql-kw">AS</span> lucro_liquido_real
<span class="sql-kw">FROM</span> carteiras_investimento c
<span class="sql-kw">INNER JOIN</span> posicao_consolidada_diaria p <span class="sql-kw">ON</span> c.id_carteira = p.id_carteira
<span class="sql-kw">LEFT JOIN</span> transacoes_investimento t <span class="sql-kw">ON</span> c.id_carteira = t.id_carteira
<span class="sql-kw">LEFT JOIN</span> custos_tributacao ct <span class="sql-kw">ON</span> t.id_transacao = ct.id_transacao
<span class="sql-kw">WHERE</span> p.data_posicao = <span class="sql-str">'2026-10-15'</span>
<span class="sql-kw">GROUP BY</span> c.id_carteira, c.nome_carteira;`,
      rawSql: `SELECT 
    c.nome_carteira,
    SUM(p.lucro_prejuizo_acumulado) AS lucro_bruto_acumulado,
    COALESCE(SUM(ct.valor_deduzido_reais), 0) AS total_taxas_b3,
    ROUND(SUM(p.lucro_prejuizo_acumulado) - COALESCE(SUM(ct.valor_deduzido_reais), 0), 2) AS lucro_liquido_real
FROM carteiras_investimento c
INNER JOIN posicao_consolidada_diaria p ON c.id_carteira = p.id_carteira
LEFT JOIN transacoes_investimento t ON c.id_carteira = t.id_carteira
LEFT JOIN custos_tributacao ct ON t.id_transacao = ct.id_transacao
WHERE p.data_posicao = '2026-10-15'
GROUP BY c.id_carteira, c.nome_carteira;`,
      headers: ['nome_carteira', 'lucro_bruto (R$)', 'taxas_b3 (R$)', 'lucro_liquido_real (R$)'],
      rows: [
        ['Reserva de Emergência', '3.500,00', '0,00', '+3.500,00'],
        ['Aposentadoria', '305,00', '18,45', '+286,55']
      ]
    },
    15: {
      id: 15,
      filename: 'query_15_liquidez_imediata.sql',
      headline: 'Posição de Títulos com Liquidez Imediata (D+0 / D+1)',
      purpose: 'Filtra os ativos disponíveis para resgate imediato ou em até 24 horas para cobrir demandas emergenciais de liquidez do negócio.',
      time: '13.3ms • 2 linhas retornadas',
      sql: `<span class="sql-kw">SELECT</span> 
    a.ticker_codigo,
    a.nome_ativo,
    a.liquidez,
    p.valor_mercado_total <span class="sql-kw">AS</span> saldo_disponivel_reais,
    inst.nome_instituicao <span class="sql-kw">AS</span> custodiante
<span class="sql-kw">FROM</span> ativos_financeiros a
<span class="sql-kw">INNER JOIN</span> posicao_consolidada_diaria p <span class="sql-kw">ON</span> a.id_ativo_financeiro = p.id_ativo_financeiro
<span class="sql-kw">INNER JOIN</span> instituicoes_financeiras inst <span class="sql-kw">ON</span> a.id_instituicao_emissora = inst.id_instituicao
<span class="sql-kw">WHERE</span> a.liquidez <span class="sql-kw">IN</span> (<span class="sql-str">'Diaria'</span>, <span class="sql-str">'D+1'</span>)
  <span class="sql-kw">AND</span> p.data_posicao = <span class="sql-str">'2026-10-15'</span>
<span class="sql-kw">ORDER BY</span> p.valor_mercado_total <span class="sql-kw">DESC</span>;`,
      rawSql: `SELECT 
    a.ticker_codigo,
    a.nome_ativo,
    a.liquidez,
    p.valor_mercado_total AS saldo_disponivel_reais,
    inst.nome_instituicao AS custodiante
FROM ativos_financeiros a
INNER JOIN posicao_consolidada_diaria p ON a.id_ativo_financeiro = p.id_ativo_financeiro
INNER JOIN instituicoes_financeiras inst ON a.id_instituicao_emissora = inst.id_instituicao
WHERE a.liquidez IN ('Diaria', 'D+1')
  AND p.data_posicao = '2026-10-15'
ORDER BY p.valor_mercado_total DESC;`,
      headers: ['ticker_codigo', 'nome_ativo', 'liquidez', 'saldo_disponivel (R$)', 'custodiante'],
      rows: [
        ['CDB_INTER_104', 'CDB Inter Liquidez Diária', 'Diaria', '148.500,00', 'Banco Inter S.A.'],
        ['TESOURO_SELIC_29', 'Tesouro Direto Selic', 'D+1', '45.000,00', 'Banco BTG Pactual S.A.']
      ]
    }
  };

  // ========================================================
  // 3. Menu Mobile (Hambúrguer & Drawer Acessível)
  // ========================================================
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-navigation');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && mainNav) {
    const toggleMenu = () => {
      const isOpen = mainNav.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileToggle.setAttribute('aria-label', isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    };

    mobileToggle.addEventListener('click', toggleMenu);

    // Fechar menu mobile ao clicar em um link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('is-open')) {
          toggleMenu();
        }
      });
    });

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        toggleMenu();
      }
    });
  }

  // ========================================================
  // 4. Inspetor de Tabelas do Schema das 10 Tabelas
  // ========================================================
  const inspectorPanel = document.getElementById('schema-inspector');
  const inspectorTableName = document.getElementById('inspector-table-name');
  const inspectorContent = document.getElementById('inspector-content');
  const btnCloseInspector = document.getElementById('btn-close-inspector');
  const inspectButtons = document.querySelectorAll('.table-entity-card .btn-inspect');

  const renderTableDetails = (tableName) => {
    const tableData = databaseSchema[tableName];
    if (!tableData || !inspectorPanel || !inspectorTableName || !inspectorContent) return;

    inspectorTableName.textContent = `${tableData.name} (${tableData.module})`;

    let html = `
      <p style="margin-bottom: 1.25rem; font-size: 0.9375rem; color: var(--text-muted);">${tableData.desc}</p>
      <div class="columns-table-wrapper">
        <table class="columns-spec-table">
          <thead>
            <tr>
              <th>Coluna</th>
              <th>Tipo de Dado</th>
              <th>Chave</th>
              <th>Nulo</th>
              <th>Descrição e Papel Relacional</th>
            </tr>
          </thead>
          <tbody>
    `;

    tableData.columns.forEach(col => {
      let keyClass = '';
      if (col.key === 'PK') keyClass = 'key-tag pk';
      else if (col.key === 'FK') keyClass = 'key-tag fk';
      else if (col.key === 'UNIQUE' || col.key === 'INDEX') keyClass = 'key-tag unique';

      html += `
        <tr>
          <td class="col-name">${col.name}</td>
          <td class="col-type">${col.type}</td>
          <td class="col-key"><span class="${keyClass}">${col.key}</span></td>
          <td>${col.nullable}</td>
          <td style="color: var(--text-muted); font-size: 0.8125rem;">${col.desc}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    inspectorContent.innerHTML = html;
    inspectorPanel.classList.add('active');

    // Scroll suave até o inspetor caso o usuário esteja em tela menor
    inspectorPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  inspectButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.table-entity-card');
      if (card) {
        const tableName = card.getAttribute('data-table');
        renderTableDetails(tableName);
      }
    });
  });

  if (btnCloseInspector && inspectorPanel) {
    btnCloseInspector.addEventListener('click', () => {
      inspectorPanel.classList.remove('active');
    });
  }

  // ========================================================
  // 5. Playground de Queries SQL (Abas, Catálogo e Simulação)
  // ========================================================
  let currentActiveQueryId = 1;
  const tabButtons = document.querySelectorAll('.query-tab-btn');
  const catalogSelect = document.getElementById('all-queries-select');
  const queryFilenameEl = document.getElementById('query-filename');
  const queryHeadlineEl = document.getElementById('query-headline');
  const queryPurposeEl = document.getElementById('query-purpose');
  const sqlDisplayCodeEl = document.getElementById('sql-display-code');
  const executionTimeEl = document.getElementById('execution-time');
  const queryResultTableEl = document.getElementById('query-result-table');
  const btnCopySql = document.getElementById('btn-copy-sql');
  const btnRunQuery = document.getElementById('btn-run-query');

  const updatePlaygroundQuery = (queryId) => {
    const qData = queriesCatalog[queryId];
    if (!qData) return;

    currentActiveQueryId = queryId;

    // Atualiza Abas Principais
    tabButtons.forEach(btn => {
      const id = parseInt(btn.getAttribute('data-query-id'), 10);
      const isSelected = (id === queryId);
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });

    // Atualiza Dropdown do Catálogo
    if (catalogSelect) {
      catalogSelect.value = queryId.toString();
    }

    // Atualiza Textos e Códigos
    if (queryFilenameEl) queryFilenameEl.textContent = qData.filename;
    if (queryHeadlineEl) queryHeadlineEl.textContent = qData.headline;
    if (queryPurposeEl) queryPurposeEl.textContent = qData.purpose;
    if (sqlDisplayCodeEl) sqlDisplayCodeEl.innerHTML = qData.sql;
    if (executionTimeEl) executionTimeEl.textContent = `Tempo de resposta: ${qData.time}`;

    // Renderiza a Tabela de Resultados
    renderResultTable(qData);
  };

  const renderResultTable = (qData) => {
    if (!queryResultTableEl) return;

    let tableHtml = `<table class="sql-result-table"><thead><tr>`;
    qData.headers.forEach(h => {
      tableHtml += `<th>${h}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;

    qData.rows.forEach(row => {
      tableHtml += `<tr>`;
      row.forEach(cell => {
        const isPositive = cell.startsWith('+');
        const cellClass = isPositive ? 'class="text-tertiary"' : '';
        tableHtml += `<td ${cellClass}>${cell}</td>`;
      });
      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;
    queryResultTableEl.innerHTML = tableHtml;
  };

  // Event Listeners das 5 Abas Rápidas
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const qId = parseInt(btn.getAttribute('data-query-id'), 10);
      updatePlaygroundQuery(qId);
    });
  });

  // Event Listener do Seletor com Todas as 15 Consultas
  if (catalogSelect) {
    catalogSelect.addEventListener('change', (e) => {
      const selectedId = parseInt(e.target.value, 10);
      updatePlaygroundQuery(selectedId);
    });
  }

  // ========================================================
  // 6. Botão "Copiar SQL" com Feedback Visual Verde (#10B981)
  // ========================================================
  if (btnCopySql) {
    btnCopySql.addEventListener('click', async () => {
      const activeData = queriesCatalog[currentActiveQueryId];
      if (!activeData) return;

      try {
        await navigator.clipboard.writeText(activeData.rawSql);
        const textSpan = btnCopySql.querySelector('.copy-text');
        const originalText = textSpan ? textSpan.textContent : 'Copiar SQL';

        btnCopySql.classList.add('copied');
        if (textSpan) textSpan.textContent = 'Copiado!';

        setTimeout(() => {
          btnCopySql.classList.remove('copied');
          if (textSpan) textSpan.textContent = originalText;
        }, 2000);
      } catch (err) {
        console.error('Falha ao copiar para o clipboard', err);
      }
    });
  }

  // ========================================================
  // 7. Simulação de Execução da Query
  // ========================================================
  if (btnRunQuery) {
    btnRunQuery.addEventListener('click', () => {
      if (!executionTimeEl || !queryResultTableEl) return;

      const activeData = queriesCatalog[currentActiveQueryId];
      executionTimeEl.innerHTML = '<span style="color: var(--primary-color);">Executando query no cluster MySQL...</span>';
      queryResultTableEl.style.opacity = '0.4';

      setTimeout(() => {
        queryResultTableEl.style.opacity = '1';
        const randomMs = (Math.random() * 8 + 8).toFixed(1);
        executionTimeEl.textContent = `Tempo de resposta: ${randomMs}ms • ${activeData.rows.length} linhas retornadas`;
        renderResultTable(activeData);
      }, 350);
    });
  }

  // ========================================================
  // 8. Formulário Técnico com Validação e Feedback Verde (#10B981)
  // ========================================================
  const form = document.getElementById('tech-contact-form');
  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');
  const topicInput = document.getElementById('topic-subject');
  const messageInput = document.getElementById('user-message');
  const feedbackMsg = document.getElementById('form-feedback');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Limpar mensagens de erro
      document.querySelectorAll('.form-error-msg').forEach(el => el.textContent = '');

      // Validação do Nome
      if (!nameInput.value.trim()) {
        document.getElementById('name-error').textContent = 'Por favor, informe seu nome completo.';
        isValid = false;
      }

      // Validação do E-mail
      if (!emailInput.value.trim()) {
        document.getElementById('email-error').textContent = 'O e-mail corporativo é obrigatório.';
        isValid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        document.getElementById('email-error').textContent = 'Insira um formato de e-mail válido (ex: nome@empresa.com).';
        isValid = false;
      }

      // Validação do Tópico
      if (!topicInput.value) {
        document.getElementById('topic-error').textContent = 'Selecione o tópico técnico da sua dúvida.';
        isValid = false;
      }

      // Validação da Mensagem
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        document.getElementById('message-error').textContent = 'A mensagem técnica deve conter pelo menos 10 caracteres.';
        isValid = false;
      }

      if (isValid) {
        // Exibe Feedback Visual Verde (#10B981)
        if (feedbackMsg) {
          feedbackMsg.classList.add('is-visible');
          form.reset();

          // Remove o feedback após 6 segundos
          setTimeout(() => {
            feedbackMsg.classList.remove('is-visible');
          }, 6000);
        }
      }
    });
  }

  // ========================================================
  // 9. Modal Interativo de DDL Completo
  // ========================================================
  const ddlModal = document.getElementById('ddl-modal');
  const btnOpenDdl = document.getElementById('btn-view-ddl');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnModalCloseAction = document.getElementById('btn-modal-close-action');
  const btnCopyDdl = document.getElementById('btn-copy-ddl');
  const ddlCodeContent = document.getElementById('ddl-code-content');

  const openDdlModal = (e) => {
    if (e) e.preventDefault();
    if (ddlModal) {
      ddlModal.classList.add('is-active');
      ddlModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeDdlModal = () => {
    if (ddlModal) {
      ddlModal.classList.remove('is-active');
      ddlModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (btnOpenDdl) btnOpenDdl.addEventListener('click', openDdlModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeDdlModal);
  if (btnModalCloseAction) btnModalCloseAction.addEventListener('click', closeDdlModal);

  if (ddlModal) {
    ddlModal.addEventListener('click', (e) => {
      if (e.target === ddlModal) closeDdlModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ddlModal && ddlModal.classList.contains('is-active')) {
      closeDdlModal();
    }
  });

  if (btnCopyDdl && ddlCodeContent) {
    btnCopyDdl.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(ddlCodeContent.innerText);
        const textSpan = btnCopyDdl.querySelector('.copy-text');
        if (textSpan) {
          const original = textSpan.textContent;
          textSpan.textContent = 'Copiado!';
          btnCopyDdl.style.borderColor = 'var(--tertiary-color)';
          btnCopyDdl.style.color = 'var(--tertiary-color)';
          setTimeout(() => {
            textSpan.textContent = original;
            btnCopyDdl.style.borderColor = '';
            btnCopyDdl.style.color = '';
          }, 2000);
        }
      } catch (err) {
        console.error('Falha ao copiar DDL', err);
      }
    });
  }

  // ========================================================
  // 10. Scroll Spy para Ativação Automática de Links no Menu
  // ========================================================
  const sections = document.querySelectorAll('section[id]');
  const handleScrollSpy = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const activeLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (activeLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          activeLink.classList.add('active');
        } else {
          activeLink.classList.remove('active');
        }
      }
    });
  };

  window.addEventListener('scroll', handleScrollSpy, { passive: true });
});
