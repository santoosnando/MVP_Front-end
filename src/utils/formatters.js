export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatDate = (date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));

export const formatPercent = (value) => `${value}%`;

export const getStatusLabel = (status) => {
  switch (status) {
    case "paid":
      return "Pago";
    case "pending":
      return "Pendente";
    case "scheduled":
      return "Agendado";
    default:
      return "Em análise";
  }
};

export const getAccountStatusLabel = (status) => {
  switch (status) {
    case "paid":
      return "Paga";
    case "pending":
      return "Pendente";
    case "scheduled":
      return "Agendada";
    default:
      return getStatusLabel(status);
  }
};
