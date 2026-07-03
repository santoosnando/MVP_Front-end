# Aura Finance — MVP

Professores: Dieinison Braga e Marisa Silva

Projeto demonstrativo de um painel financeiro construído com React + Vite.

Funcionalidades principais implementadas (MVP):

- Páginas: Dashboard, Contas, Despesas, Receitas, Configurações e NotFound (>=3 páginas).
- Componentização: componentes reutilizáveis como `GlassCard`, `StatCard`, `Table`, `Modal`, `Input`, `Button`, etc.
- Navegação: roteamento com `react-router-dom`, uso de hooks `useNavigate`, `useParams` e `useLocation`.
- Formulários com labels, selects padronizados e validações simples.
- Despesas: recorrência mensal, parcelas editáveis, aviso de vencimento (1-7 dias) e coluna "Pago (mês vigente)" com checkbox.
- Extratos: visualização simplificada por conta e por despesa (modal) e página de detalhe por conta (`/accounts/:id`).
- Dashboard: cards interativos (clicáveis), codificação de cores para entradas/saídas e gráfico de comparação mês atual x mês anterior.

Arquitetura e pontos importantes:

- Componentização: os componentes ficam em `src/components/` e são usados em várias páginas.
- Dados de exemplo: `src/data/` contém `accounts`, `expenses` e `income` para popular a UI sem backend.
- Serviços: utilitários como `createId` e lógica de lembretes estão em `src/services/financeService.js`.

Como rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Rodar em modo de desenvolvimento:

```bash
npm run dev
```

3. Build de produção:

```bash
npm run build
```

Observações para entrega

- Para hospedar publicamente (requisito da disciplina), faça push deste repositório para o GitHub e inclua o link no seu README (não incluído automaticamente aqui).
- O README deve conter instruções de instalação (já presentes) e uma breve descrição das páginas, componentes e hooks utilizados.

Lista de componentes implementados (exemplos):

- `GlassCard`, `StatCard`, `Table`, `Modal`, `Input`, `Button`, `PageTitle`, `SearchBar`, `Table`, `Toast`.

Se quiser, eu posso:

- Gerar um `README` mais detalhado com imagens e roteiro de validação;
- Preparar instruções para deploy no GitHub Pages ou Vercel;
- Comitar e formatar as alterações finais.

---
Template inicial: adaptado a partir do template oficial `create-vite` para React.
