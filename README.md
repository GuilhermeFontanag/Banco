# FinData: Arquitetura de Banco de Dados para Gestão de Ativos Financeiros

## Sobre o Projeto
O FinData é um modelo de banco de dados relacional desenvolvido em MySQL, projetado para o gerenciamento avançado de portfólios de investimentos e estruturação de dados financeiros. O schema foi arquitetado para refletir a complexidade do mercado financeiro, suportando operações de renda fixa e variável, múltiplos prazos de liquidação (ex: D+1, D+2), cálculos de retenção tributária e marcação a mercado de ativos.

A padronização do projeto segue estritamente as convenções de nomenclatura (snake_case) e estabelece rigorosas restrições de integridade referencial.

### Digrama de Entidade-Relacionamento (ER)
O código Mermaid abaixo é renderizado automaticamente pelas plataformas de versionamento (GitHub/GitLab), apresentando a arquitetura relacional e as conexões lógicas entre as entidades do sistema.

```mermaid
erDiagram
    INSTITUICOES_FINANCEIRAS ||--o{ ATIVOS_FINANCEIROS : "emite"
    INSTITUICOES_FINANCEIRAS ||--o{ TRANSACOES_INVESTIMENTO : "intermedia"
    TIPOS_ATIVOS ||--o{ ATIVOS_FINANCEIROS : "categoriza"
    CARTEIRAS_INVESTIMENTO ||--o{ TRANSACOES_INVESTIMENTO : "possui"
    CARTEIRAS_INVESTIMENTO ||--o{ PROVENTOS_RECEBIDOS : "recebe"
    CARTEIRAS_INVESTIMENTO ||--o{ POSICAO_CONSOLIDADA_DIARIA : "monitora"
    ATIVOS_FINANCEIROS ||--o{ TRANSACOES_INVESTIMENTO : "negociado_em"
    ATIVOS_FINANCEIROS ||--o{ PROVENTOS_RECEBIDOS : "gera"
    ATIVOS_FINANCEIROS ||--o{ HISTORICO_COTACOES_TAXAS : "cotado_em"
    ATIVOS_FINANCEIROS ||--o{ POSICAO_CONSOLIDADA_DIARIA : "compoe"
    TRANSACOES_INVESTIMENTO ||--o{ CUSTOS_TRIBUTACAO : "gera_custo"
    PROVENTOS_RECEBIDOS ||--o{ CUSTOS_TRIBUTACAO : "sofre_retencao"

    INSTITUICOES_FINANCEIRAS {
        int id_instituicao PK
        varchar nome_instituicao
        varchar cnpj
        enum tipo_instituicao
        varchar codigo_compe
    }

    INDICES_BENCHMARKS {
        int id_indice PK
        varchar nome_indice
        date data_referencia
        decimal valor_taxa
        enum periodicidade
    }

    TIPOS_ATIVOS {
        int id_tipo_ativo PK
        varchar nome_tipo
        enum categoria_macro
        text descricao
    }

    CARTEIRAS_INVESTIMENTO {
        int id_carteira PK
        varchar nome_carteira
        text objetivo
        date data_criacao
    }

    ATIVOS_FINANCEIROS {
        int id_ativo_financeiro PK
        int id_tipo_ativo FK
        int id_instituicao_emissora FK
        varchar ticker_codigo
        varchar nome_ativo
        varchar indexador_taxa
        date data_emissao
        date data_vencimento
        varchar liquidez
    }

    TRANSACOES_INVESTIMENTO {
        int id_transacao PK
        int id_carteira FK
        int id_ativo_financeiro FK
        int id_corretora FK
        enum tipo_operacao
        datetime data_operacao
        decimal quantidade
        decimal preco_unitario
        decimal valor_total
    }

    PROVENTOS_RECEBIDOS {
        int id_provento PK
        int id_ativo_financeiro FK
        int id_carteira FK
        enum tipo_provento
        date data_com
        date data_pagamento
        decimal valor_bruto
        decimal imposto_retido
        decimal valor_liquido
    }

    CUSTOS_TRIBUTACAO {
        int id_custo PK
        int id_transacao FK
        int id_provento FK
        varchar tipo_custo
        decimal aliquota_aplicada
        decimal valor_custo
        date data_registro
    }

    HISTORICO_COTACOES_TAXAS {
        int id_historico PK
        int id_ativo_financeiro FK
        date data_cotacao
        decimal preco_fechamento_unitario
        varchar fonte_dados
    }

    POSICAO_CONSOLIDADA_DIARIA {
        int id_posicao PK
        int id_carteira FK
        int id_ativo_financeiro FK
        date data_posicao
        decimal quantidade_saldo
        decimal custo_medio_unitario
        decimal valor_investido_total
        decimal valor_mercado_total
        decimal lucro_prejuizo_acumulado
        decimal rentabilidade_pct_acumulada
    }
```


   ##  Normalização de Dados (1FN a 4FN)
O banco de dados foi projetado em conformidade com as regras de normalização para evitar redundância e anomalias de transação:

> 1FN: Atributos atômicos e presença de Chaves Primárias exclusivas em todas as tabelas.

>2FN: Eliminação de dependências parciais; atributos não-chave dependem da totalidade da chave primária (ex: tabela de histórico de cotações).

>3FN: Eliminação de dependências transitivas; isolamento de dados de instituições emissoras em tabelas de domínio.

>4FN: Prevenção de dependências multivaloradas; cada tabela gerencia um escopo único e independente de dados.

## Instruções de Execução
Realize o clone deste repositório.

Importe o script FinData_DDL_DML.sql em uma instância do MySQL (utilizando ferramentas como MySQL Workbench, DBeaver ou via CLI).

Execute o código para instanciar o schema gestao_ativos e popular a base com os dados iniciais de homologação.

Consulte a pasta /scripts para acessar as consultas (queries) analíticas prontas para execução.

Consultas Analíticas (Queries)
O projeto inclui scripts SQL avançados, utilizando funções de agregação, agrupamentos e junções complexas, para extração de métricas de negócio, tais como:

Apuração de lucro/prejuízo acumulado e marcação a mercado por carteira de investimento.

Levantamento de proventos líquidos recebidos em períodos contábeis específicos.

Análise de impacto tributário (IRRF, emolumentos B3) sobre as operações executadas.