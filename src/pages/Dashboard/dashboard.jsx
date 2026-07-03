import { ArrowDownRight, ArrowUpRight, BadgeDollarSign, CircleDollarSign, Wallet2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/common/GlassCard";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import PageTitle from "../../components/common/PageTitle";
import StatCard from "../../components/common/StatCard";
import { accounts } from "../../data/accounts";
import { expenses } from "../../data/expenses";
import { income } from "../../data/income";
import { getUpcomingExpenseReminders } from "../../services/financeService";
import { formatCurrency, formatDate, getAccountStatusLabel } from "../../utils/formatters";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountData] = useState(accounts);
  const [expenseData] = useState(expenses);
  const [incomeData] = useState(income);
  const [pendingAccountsModalOpen, setPendingAccountsModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [chartTooltipLeft, setChartTooltipLeft] = useState(0);
  const [chartTooltipTop, setChartTooltipTop] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 600);
    toast.success("Dados carregados com sucesso");
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    getUpcomingExpenseReminders(expenseData, 7).forEach((item) => {
      const label = item.daysUntil === 0 ? "hoje" : item.daysUntil === 1 ? "amanhã" : `em ${item.daysUntil} dias`;
      toast(`Atenção: ${item.title} vence ${label}`, { icon: "⏰" });
    });
  }, [expenseData]);

  const totals = useMemo(() => {
    const incomeTotal = incomeData.reduce((sum, item) => sum + item.amount, 0);
    const expenseTotal = expenseData.reduce((sum, item) => sum + item.amount, 0);

    return {
      incomeTotal,
      expenseTotal,
      balance: incomeTotal - expenseTotal,
      pending: accountData.filter((item) => item.status === "pending").length,
    };
  }, [accountData, expenseData, incomeData]);

  const pendingAccounts = useMemo(() => accountData.filter((item) => item.status === "pending"), [accountData]);

  const latestMovements = useMemo(() => {
    return [...incomeData.map((item) => ({ ...item, type: "income" })), ...expenseData.map((item) => ({ ...item, type: "expense" }))]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [expenseData, incomeData]);

  const comparisonChart = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = -8; i <= 3; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = d.toISOString().slice(0, 7);
      const monthLabel = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
      const yearLabel = String(d.getFullYear()).slice(-2);
      const label = `${monthLabel} ${yearLabel}`;
      months.push({ key, label, isFuture: i > 0, isCurrent: i === 0 });
    }

    const actualMonths = months.filter((month) => !month.isFuture);

    const monthTotals = actualMonths.map((month) => ({
      income: incomeData.filter((it) => it.date?.slice(0, 7) === month.key).reduce((sum, it) => sum + it.amount, 0),
      expense: expenseData.filter((it) => it.date?.slice(0, 7) === month.key).reduce((sum, it) => sum + it.amount, 0),
    }));

    const seasonalWave = (index) => {
      const curve = [0.94, 0.98, 1.01, 1.05, 1.08, 1.12];
      return curve[index % curve.length];
    };

    const fillMissingHistory = (values, base, variance) =>
      values.map((value, index) => {
        if (value > 0) return value;
        const trend = 0.98 + index * 0.035;
        const oscillation = seasonalWave(index);
        return Math.round(base * trend * oscillation + variance * (0.8 + index * 0.02));
      });

    const historicalIncomeBase = incomeData.length ? incomeData.reduce((sum, item) => sum + item.amount, 0) / incomeData.length : 3600;
    const historicalExpenseBase = expenseData.length ? expenseData.reduce((sum, item) => sum + item.amount, 0) / expenseData.length : 1650;

    const monthlyIncome = fillMissingHistory(monthTotals.map((entry) => entry.income), historicalIncomeBase, 180);
    const monthlyExpense = fillMissingHistory(monthTotals.map((entry) => entry.expense), historicalExpenseBase, 70);

    const currentIndex = actualMonths.length - 1;
    const projectedIncome = [];
    const projectedExpense = [];

    let lastIncome = monthlyIncome[currentIndex];
    let lastExpense = monthlyExpense[currentIndex];

    for (let step = 1; step <= 3; step += 1) {
      lastIncome = Math.round(lastIncome * (1.04 + step * 0.02));
      lastExpense = Math.round(lastExpense * (1.015 + step * 0.012));
      projectedIncome.push(lastIncome);
      projectedExpense.push(lastExpense);
    }

    const combinedIncome = [...monthlyIncome, ...projectedIncome];
    const combinedExpense = [...monthlyExpense, ...projectedExpense];

    const chartMaxValue = 10000;
    const yAxisTicks = [0, 2500, 5000, 7500, 10000];
    const historicalEnd = actualMonths.length - 1;
    const plot = { left: 132, top: 30, right: 936, bottom: 228 };
    const width = plot.right - plot.left;
    const height = plot.bottom - plot.top;
    const toPoint = (value, index) => ({
      x: plot.left + (width / (months.length - 1)) * index,
      y: plot.bottom - (Math.min(value, chartMaxValue) / chartMaxValue) * height,
    });
    const incomePoints = months.map((_, index) => toPoint(combinedIncome[index], index));
    const expensePoints = months.map((_, index) => toPoint(combinedExpense[index], index));
    const buildSmoothPath = (points) => {
      if (points.length <= 1) return points.length ? `M ${points[0].x} ${points[0].y}` : "";

      const d = [`M ${points[0].x} ${points[0].y}`];
      for (let i = 0; i < points.length - 1; i += 1) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
      }
      return d.join(" ");
    };
    const buildAreaPath = (points) =>
      points.length
        ? `M ${points[0].x} ${plot.bottom} L ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${points[points.length - 1].x} ${plot.bottom} Z`
        : "";
    const historicalPoints = incomePoints.slice(0, historicalEnd + 1);
    const historicalExpensePoints = expensePoints.slice(0, historicalEnd + 1);
    const projectionPoints = incomePoints.slice(historicalEnd);
    const projectionExpensePoints = expensePoints.slice(historicalEnd);

    return {
      months,
      monthlyIncome: combinedIncome,
      monthlyExpense: combinedExpense,
      maxValue: chartMaxValue,
      yAxisTicks,
      plot,
      incomePoints,
      expensePoints,
      historicalEnd,
      incomeAreaPath: buildAreaPath(historicalPoints),
      expenseAreaPath: buildAreaPath(historicalExpensePoints),
      incomeLinePath: buildSmoothPath(historicalPoints),
      expenseLinePath: buildSmoothPath(historicalExpensePoints),
      incomeProjectionPath: buildSmoothPath(projectionPoints),
      expenseProjectionPath: buildSmoothPath(projectionExpensePoints),
    };
  }, [expenseData, incomeData]);

  useEffect(() => {
    if (hoveredIndex === null) return;
    const tooltipWidth = 220;
    const tooltipHeight = 88;
    const x = comparisonChart.incomePoints[hoveredIndex]?.x ?? 0;
    const y = comparisonChart.incomePoints[hoveredIndex]?.y ?? comparisonChart.plot.top;
    const relativeX = x - comparisonChart.plot.left;
    const maxLeft = (comparisonChart.plot.right - comparisonChart.plot.left) - tooltipWidth - 8;
    setChartTooltipLeft(Math.max(8, Math.min(relativeX - tooltipWidth / 2, maxLeft)));
    const topCandidate = y - tooltipHeight - 8;
    const maxTop = comparisonChart.plot.bottom - tooltipHeight - 8;
    setChartTooltipTop(Math.max(8, Math.min(topCandidate, maxTop)));
  }, [comparisonChart, hoveredIndex]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.page}>
      <PageTitle
        eyebrow="Resumo financeiro"
        title="Seu painel financeiro"
        description="Acompanhe receitas, despesas, vencimentos e saúde da sua carteira em uma única visão."
      />

      <div className={styles.statsGrid}>
        <StatCard
          title="Saldo geral"
          value={formatCurrency(totals.balance)}
          hint="Receitas menos despesas"
          icon={CircleDollarSign}
          tone="success"
          trend="+12%"
        />
        <StatCard
          title="Receitas"
          value={formatCurrency(totals.incomeTotal)}
          hint="Último mês"
          icon={ArrowUpRight}
          tone="success"
          trend="+8%"
          onIconClick={() => navigate("/receitas")}
          iconLabel="Abrir receitas"
        />
        <StatCard
          title="Despesas"
          value={formatCurrency(totals.expenseTotal)}
          hint="Planejamento"
          icon={ArrowDownRight}
          tone="warning"
          trend="-3%"
          onIconClick={() => navigate("/despesas")}
          iconLabel="Abrir despesas"
        />
        <StatCard
          title="Contas pendentes"
          value={totals.pending}
          hint="Vencimentos em aberto"
          icon={Wallet2}
          tone="danger"
          trend="2 hoje"
          onIconClick={() => setPendingAccountsModalOpen(true)}
          iconLabel="Ver contas pendentes"
        />
      </div>

      <div className={styles.grid}>
        <GlassCard className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Últimas movimentações</h3>
            <BadgeDollarSign size={18} />
          </div>
          <ul className={styles.list}>
            {latestMovements.map((item) => (
              <li key={item.id} className={styles.listItem}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.category}</p>
                </div>
                <div className={styles.amountWrap}>
                  {(() => {
                    const isIncome = item.type === "income" || ["salario", "freelance", "investimentos", "rendimentos"].includes(item.category);
                    return (
                      <span className={isIncome ? styles.positive : styles.negative}>
                        {formatCurrency(item.amount)}
                      </span>
                    );
                  })()}
                  <small>{formatDate(item.date)}</small>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>Contas próximas do vencimento</h3>
            <Wallet2 size={18} />
          </div>
          <ul className={styles.list}>
            {accountData.slice(0, 3).map((account) => (
              <li key={account.id} className={styles.listItem}>
                <div>
                  <strong>{account.name}</strong>
                  <p>Vence em {formatDate(account.dueDate)}</p>
                </div>
                <span>{formatCurrency(account.balance)}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className={styles.healthCard}>
        <div className={styles.panelHeader}>
          <h3>Saúde financeira</h3>
          <span className={styles.score}>88/100</span>
        </div>
        <div className={styles.chartLegend}>
          <span><i className={styles.legendDotIncome} /> Receitas</span>
          <span><i className={styles.legendDotExpense} /> Despesas</span>
        </div>
        <div className={styles.chartWrap}>
            {hoveredIndex !== null ? (
              <div
                className={styles.chartTooltip}
                style={{
                  top: `${chartTooltipTop}px`,
                  left: `${chartTooltipLeft}px`,
                }}
              >
              <strong>{comparisonChart.months[hoveredIndex].label}</strong>
              <span>Receitas: {formatCurrency(comparisonChart.monthlyIncome[hoveredIndex])}</span>
              <span>Despesas: {formatCurrency(comparisonChart.monthlyExpense[hoveredIndex])}</span>
            </div>
          ) : null}
          <svg viewBox="0 0 980 260" className={styles.chartSvg}>
            <defs>
              <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#75d8ff" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#75d8ff" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="incomeStroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#75d8ff" />
                <stop offset="100%" stopColor="#8a7cff" />
              </linearGradient>
              <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ff6e8f" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ff6e8f" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="expenseStroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#ff6e8f" />
                <stop offset="100%" stopColor="#ffb454" />
              </linearGradient>
            </defs>
            <rect x="30" y="14" width="920" height="220" rx="24" className={styles.chartBackplate} />
            {comparisonChart.yAxisTicks.map((tick) => {
              const y = comparisonChart.plot.bottom - (tick / comparisonChart.maxValue) * (comparisonChart.plot.bottom - comparisonChart.plot.top);

              return (
                <g key={tick}>
                  <line x1="128" y1={y} x2="936" y2={y} className={styles.chartGridLine} />
                  <text x="116" y={y + 4} textAnchor="end" className={styles.axisValueLabel}>
                    {formatCurrency(tick)}
                  </text>
                </g>
              );
            })}
            <path d={comparisonChart.expenseAreaPath} fill="url(#expenseFill)" />
            <path d={comparisonChart.incomeAreaPath} fill="url(#incomeFill)" />
            <path
              d={comparisonChart.expenseLinePath}
              fill="none"
              stroke="url(#expenseStroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={comparisonChart.expenseProjectionPath}
              fill="none"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 8"
            />
            <path
              d={comparisonChart.incomeLinePath}
              fill="none"
              stroke="url(#incomeStroke)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={comparisonChart.incomeProjectionPath}
              fill="none"
              stroke="rgba(255,255,255,0.42)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 8"
            />
            {comparisonChart.incomePoints.map((point, index) => (
              <g
                key={comparisonChart.months[index].key}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                tabIndex={0}
                role="button"
              >
                {index <= comparisonChart.historicalEnd ? (
                  <>
                    <circle cx={point.x} cy={point.y} r="4.5" className={index === comparisonChart.historicalEnd ? styles.currentDot : styles.incomeDot} />
                    <circle cx={comparisonChart.expensePoints[index].x} cy={comparisonChart.expensePoints[index].y} r="3.8" className={styles.expenseDot} />
                  </>
                ) : null}
                <text
                  x={point.x}
                  y="240"
                  textAnchor="middle"
                  className={`${styles.chartLabel} ${index === comparisonChart.historicalEnd ? styles.currentLabel : ""} ${
                    index > comparisonChart.historicalEnd ? styles.futureLabel : ""
                  }`}
                >
                  {comparisonChart.months[index].label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </GlassCard>

      <Modal open={pendingAccountsModalOpen} title="Contas pendentes" onClose={() => setPendingAccountsModalOpen(false)}>
        {pendingAccounts.length ? (
          <div className={styles.pendingList}>
            {pendingAccounts.map((account) => (
              <div key={account.id} className={styles.pendingItem}>
                <div>
                  <strong>{account.name}</strong>
                  <p>Vence em {formatDate(account.dueDate)}</p>
                </div>
                <div className={styles.pendingMeta}>
                  <span>{formatCurrency(account.balance)}</span>
                  <small>{getAccountStatusLabel(account.status)}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Nenhuma conta pendente no momento.</p>
        )}
      </Modal>
    </div>
  );
}
