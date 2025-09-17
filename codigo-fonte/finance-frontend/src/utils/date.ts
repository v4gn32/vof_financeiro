export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

export const getMonthName = (monthString: string): string => {
  const date = new Date(monthString + '-01');
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};