# Aura Finance - MVP

Projeto desenvolvido para demonstrar os conceitos de componentizacao com React, uso de hooks e navegacao entre paginas com React Router.

## Para o professor

Este sistema foi construido como um MVP de front-end e contem os pontos pedidos na proposta da disciplina:

- Aplicacao com mais de 3 paginas.
- Uso de componentes reutilizaveis.
- Uso de React com estado, props e hooks.
- Navegacao entre rotas com React Router.
- Layout responsivo para desktop e telas menores.
- Estrutura pensada para demonstrar organizacao de codigo e reuso.

## Observações

- O projeto esta focado em front-end, sem backend real.
- Os dados utilizados sao simulados em memoria para permitir a navegacao e interacao da interface.
- As acoes de cadastro, edicao, remocao e filtro foram simuladas para representar a experiencia de uso.

## Paginas disponiveis

- Dashboard
- Contas
- Despesas
- Receitas
- Configuracoes
- Detalhe de conta
- Pagina 404 para rotas inexistentes

## Componentes reutilizaveis

Os principais componentes reaproveitados em varias telas estao em `src/components/`:

- `Button`
- `GlassCard`
- `Input`
- `Modal`
- `Select`
- `SearchBar`
- `PageTitle`
- `StatCard`
- `Table`
- `EmptyState`
- `Loader`
- `Toast`

## Hooks e recursos usados

- `useState`
- `useEffect`
- `useMemo`
- `useRef`
- `useNavigate`
- `useParams`
- `useLocation`

## Como executar o projeto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Rodar em desenvolvimento

```bash
npm run dev
```

### 3. Gerar build de producao

```bash
npm run build
```

## Como usar o sistema

- Acesse o Dashboard para visualizar o resumo financeiro.
- Use a sidebar para navegar entre Contas, Despesas, Receitas e Configuracoes.
- Em Contas, voce pode criar, editar, remover e abrir o extrato de cada conta.
- Em Despesas, voce pode filtrar, cadastrar, editar, marcar como paga e acompanhar avisos de vencimento.
- Em Receitas, voce pode cadastrar, editar e remover entradas.
- Em Configuracoes, voce pode alternar a opcao de notificacoes.
- A pagina 404 aparece quando a rota informada nao existe.

## Estrutura principal

- `src/components/` - componentes reutilizaveis
- `src/pages/` - telas da aplicacao
- `src/hooks/` - hooks de dados e filtragem
- `src/data/` - dados simulados
- `src/services/` - regras auxiliares da aplicacao
- `src/rotas/` - configuracao das rotas


Este projeto foi montado para evidenciar componentizacao, reuso e navegacao em React.
