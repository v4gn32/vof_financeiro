import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction, CreditCardTransaction, Investment } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Safe text rendering function to handle Portuguese characters
const safeText = (text: string | undefined | null): string => {
  if (!text) return '';
  return text.toString()
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ã/g, 'a')
    .replace(/Ã/g, 'A')
    .replace(/õ/g, 'o')
    .replace(/Õ/g, 'O')
    .replace(/á/g, 'a')
    .replace(/Á/g, 'A')
    .replace(/é/g, 'e')
    .replace(/É/g, 'E')
    .replace(/í/g, 'i')
    .replace(/Í/g, 'I')
    .replace(/ó/g, 'o')
    .replace(/Ó/g, 'O')
    .replace(/ú/g, 'u')
    .replace(/Ú/g, 'U')
    .replace(/â/g, 'a')
    .replace(/Â/g, 'A')
    .replace(/ê/g, 'e')
    .replace(/Ê/g, 'E')
    .replace(/î/g, 'i')
    .replace(/Î/g, 'I')
    .replace(/ô/g, 'o')
    .replace(/Ô/g, 'O')
    .replace(/û/g, 'u')
    .replace(/Û/g, 'U');
};

// Safe currency formatting
const formatCurrency = (amount: number): string => {
  try {
    return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } catch (error) {
    return `R$ ${amount.toFixed(2)}`;
  }
};

// Safe date formatting
const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data invalida';
  }
};

export const generatePDFReport = (
  transactions: Transaction[],
  creditCardTransactions: CreditCardTransaction[],
  investments: Investment[],
  period: string
) => {
  try {
    const doc = new jsPDF();
    
    // Set font to handle special characters better
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.text(safeText('Relatorio Financeiro'), 20, 20);
    doc.setFontSize(12);
    doc.text(safeText(`Periodo: ${period}`), 20, 30);
    doc.text(safeText(`Gerado em: ${formatDate(new Date())}`), 20, 40);

    let yPosition = 60;

    // Calculate totals safely
    const totalIncome = transactions
      .filter(t => t && t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalExpenses = transactions
      .filter(t => t && t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalCreditCard = creditCardTransactions
      .filter(t => t && t.amount)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalInvestments = investments
      .filter(i => i && i.transactionType === 'deposit')
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    // Summary section
    doc.setFontSize(14);
    doc.text(safeText('Resumo Financeiro'), 20, yPosition);
    yPosition += 10;

    const summaryData = [
      [safeText('Receitas Totais'), formatCurrency(totalIncome)],
      [safeText('Despesas Totais'), formatCurrency(totalExpenses)],
      [safeText('Gastos no Cartao'), formatCurrency(totalCreditCard)],
      [safeText('Total Investido'), formatCurrency(totalInvestments)],
      [safeText('Saldo Liquido'), formatCurrency(totalIncome - totalExpenses - totalCreditCard)],
    ];

    doc.autoTable({
      startY: yPosition,
      head: [[safeText('Categoria'), safeText('Valor')]],
      body: summaryData,
      theme: 'grid',
      headStyles: { 
        fillColor: [34, 197, 94],
        fontStyle: 'bold',
        font: 'helvetica'
      },
      styles: {
        font: 'helvetica',
        fontSize: 10
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Transactions section
    if (transactions && transactions.length > 0) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(safeText('Transacoes'), 20, yPosition);
      yPosition += 10;

      const transactionData = transactions
        .filter(t => t && t.date && t.description)
        .map(t => [
          formatDate(t.date),
          safeText(t.description),
          safeText(t.category),
          safeText(t.type === 'income' ? 'Receita' : 'Despesa'),
          formatCurrency(t.amount || 0),
        ]);

      if (transactionData.length > 0) {
        doc.autoTable({
          startY: yPosition,
          head: [[safeText('Data'), safeText('Descricao'), safeText('Categoria'), safeText('Tipo'), safeText('Valor')]],
          body: transactionData,
          theme: 'striped',
          headStyles: { 
            fillColor: [59, 130, 246],
            fontStyle: 'bold',
            font: 'helvetica'
          },
          styles: {
            font: 'helvetica',
            fontSize: 9
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
    }

    // Credit Card Transactions section
    if (creditCardTransactions && creditCardTransactions.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(safeText('Compras no Cartao'), 20, yPosition);
      yPosition += 10;

      const creditCardData = creditCardTransactions
        .filter(t => t && t.date && t.description)
        .map(t => [
          formatDate(t.date),
          safeText(t.description),
          safeText(t.category),
          formatCurrency(t.amount || 0),
          t.installments && t.installments > 1 ? `${t.currentInstallment || 1}/${t.installments}` : '1/1',
        ]);

      if (creditCardData.length > 0) {
        doc.autoTable({
          startY: yPosition,
          head: [[safeText('Data'), safeText('Descricao'), safeText('Categoria'), safeText('Valor'), safeText('Parcelas')]],
          body: creditCardData,
          theme: 'striped',
          headStyles: { 
            fillColor: [147, 51, 234],
            fontStyle: 'bold',
            font: 'helvetica'
          },
          styles: {
            font: 'helvetica',
            fontSize: 9
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
    }

    // Investments section
    if (investments && investments.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.text(safeText('Investimentos'), 20, yPosition);
      yPosition += 10;

      const investmentData = investments
        .filter(i => i && i.date && i.description)
        .map(i => [
          formatDate(i.date),
          safeText(i.type),
          safeText(i.description),
          safeText(i.transactionType === 'deposit' ? 'Aporte' : 'Retirada'),
          formatCurrency(i.amount || 0),
        ]);

      if (investmentData.length > 0) {
        doc.autoTable({
          startY: yPosition,
          head: [[safeText('Data'), safeText('Tipo'), safeText('Descricao'), safeText('Operacao'), safeText('Valor')]],
          body: investmentData,
          theme: 'striped',
          headStyles: { 
            fillColor: [16, 185, 129],
            fontStyle: 'bold',
            font: 'helvetica'
          },
          styles: {
            font: 'helvetica',
            fontSize: 9
          }
        });
      }
    }

    return doc;
  } catch (error) {
    console.error('Erro detalhado na geracao do PDF:', error);
    throw new Error(`Falha ao gerar o relatorio PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

export const generateExcelReport = (
  transactions: Transaction[],
  creditCardTransactions: CreditCardTransaction[],
  investments: Investment[],
  period: string
) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const totalIncome = transactions
      .filter(t => t && t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalExpenses = transactions
      .filter(t => t && t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalCreditCard = creditCardTransactions
      .filter(t => t && t.amount)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalInvestments = investments
      .filter(i => i && i.transactionType === 'deposit')
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    const summaryData = [
      ['Relatório Financeiro - ' + period],
      ['Gerado em: ' + formatDate(new Date())],
      [''],
      ['RESUMO FINANCEIRO'],
      ['Receitas Totais', totalIncome],
      ['Despesas Totais', totalExpenses],
      ['Gastos no Cartão', totalCreditCard],
      ['Total Investido', totalInvestments],
      ['Saldo Líquido', totalIncome - totalExpenses - totalCreditCard],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Transactions sheet
    if (transactions && transactions.length > 0) {
      const transactionData = [
        ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Forma de Pagamento'],
        ...transactions
          .filter(t => t && t.date && t.description)
          .map(t => [
            formatDate(t.date),
            t.description || '',
            t.category || '',
            t.type === 'income' ? 'Receita' : 'Despesa',
            t.amount || 0,
            t.paymentMethod || '',
          ]),
      ];

      const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
      XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transações');
    }

    // Credit Card sheet
    if (creditCardTransactions && creditCardTransactions.length > 0) {
      const creditCardData = [
        ['Data', 'Descrição', 'Categoria', 'Valor', 'Parcelas'],
        ...creditCardTransactions
          .filter(t => t && t.date && t.description)
          .map(t => [
            formatDate(t.date),
            t.description || '',
            t.category || '',
            t.amount || 0,
            t.installments && t.installments > 1 ? `${t.currentInstallment || 1}/${t.installments}` : '1/1',
          ]),
      ];

      const creditCardSheet = XLSX.utils.aoa_to_sheet(creditCardData);
      XLSX.utils.book_append_sheet(workbook, creditCardSheet, 'Cartão de Crédito');
    }

    // Investments sheet
    if (investments && investments.length > 0) {
      const investmentData = [
        ['Data', 'Tipo', 'Descrição', 'Operação', 'Valor', 'Observações'],
        ...investments
          .filter(i => i && i.date && i.description)
          .map(i => [
            formatDate(i.date),
            i.type || '',
            i.description || '',
            i.transactionType === 'deposit' ? 'Aporte' : 'Retirada',
            i.amount || 0,
            i.notes || '',
          ]),
      ];

      const investmentSheet = XLSX.utils.aoa_to_sheet(investmentData);
      XLSX.utils.book_append_sheet(workbook, investmentSheet, 'Investimentos');
    }

    return workbook;
  } catch (error) {
    console.error('Erro na geração do Excel:', error);
    throw new Error('Falha ao gerar o relatório Excel');
  }
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  try {
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Erro ao fazer download do PDF:', error);
    throw new Error('Falha ao fazer download do PDF');
  }
};

export const downloadExcel = (workbook: any, filename: string) => {
  try {
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Erro ao fazer download do Excel:', error);
    throw new Error('Falha ao fazer download do Excel');
  }
};