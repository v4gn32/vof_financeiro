import React, { useState } from 'react';
import { Plus, CreditCard, Calendar, DollarSign, CreditCard as Edit, Trash2, ShoppingCart } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import CreditCardTransactionForm from '../components/CreditCard/CreditCardTransactionForm';
import CreditCardForm from '../components/CreditCard/CreditCardForm';

const CreditCards: React.FC = () => {
  const { 
    creditCards, 
    creditCardTransactions, 
    addCreditCard,
    addCreditCardTransaction, 
    updateCreditCardTransaction, 
    deleteCreditCardTransaction 
  } = useFinancial();
  
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getCardTransactions = (cardId: string) => {
    return creditCardTransactions.filter(t => t.cardId === cardId);
  };

  const getCardTotal = (cardId: string) => {
    return getCardTransactions(cardId).reduce((sum, t) => sum + t.amount, 0);
  };

  const handleAddTransaction = (cardId: string) => {
    setSelectedCard(cardId);
    setIsTransactionFormOpen(true);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setSelectedCard(transaction.cardId);
    setIsTransactionFormOpen(true);
  };

  const handleFormSubmit = (transactionData: any) => {
    if (editingTransaction) {
      updateCreditCardTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(null);
    } else {
      addCreditCardTransaction({ ...transactionData, cardId: selectedCard! });
    }
    setSelectedCard(null);
  };

  const handleFormClose = () => {
    setIsTransactionFormOpen(false);
    setEditingTransaction(null);
    setSelectedCard(null);
  };

  const handleCardFormSubmit = (cardData: any) => {
    if (editingCard) {
      // updateCreditCard(editingCard.id, cardData);
      setEditingCard(null);
    } else {
      addCreditCard(cardData);
    }
  };

  const handleCardFormClose = () => {
    setIsCardFormOpen(false);
    setEditingCard(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cartões de Crédito</h2>
          <p className="text-gray-600">Controle seus cartões e faturas</p>
        </div>
        <button 
          onClick={() => setIsCardFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {creditCards.map((card) => (
          <div key={card.id} className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{card.name}</h3>
                <p className="text-blue-100">**** **** **** {card.lastFourDigits}</p>
              </div>
              <CreditCard className="w-8 h-8 text-white opacity-80" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-100">Limite:</span>
                <span className="font-semibold">{formatCurrency(card.limit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Fechamento:</span>
                <span>Dia {card.closingDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">Vencimento:</span>
                <span>Dia {card.dueDay}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-400">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Fatura Atual:</span>
                <span className="text-xl font-bold">{formatCurrency(getCardTotal(card.id))}</span>
              </div>
              <button
                onClick={() => handleAddTransaction(card.id)}
                className="w-full mt-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Compra
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximas Faturas</h3>
          <div className="space-y-4">
            {creditCards.map(card => (
              <div key={card.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{card.name}</p>
                    <p className="text-sm text-gray-600">Vence dia {card.dueDay}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(getCardTotal(card.id))}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Em dia</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Compras Recentes</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {creditCardTransactions.slice(0, 10).map((transaction) => {
              const card = creditCards.find(c => c.id === transaction.cardId);
              return (
                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                        <p className="text-sm text-gray-600">
                          {card?.name} • {transaction.category}
                          {transaction.installments && transaction.installments > 1 && (
                            <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                              {transaction.currentInstallment}/{transaction.installments}x
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTransaction(transaction)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCreditCardTransaction(transaction.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {creditCardTransactions.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma compra registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreditCardTransactionForm
        isOpen={isTransactionFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        creditCards={creditCards}
        transaction={editingTransaction}
      />

      <CreditCardForm
        isOpen={isCardFormOpen}
        onClose={handleCardFormClose}
        onSubmit={handleCardFormSubmit}
        card={editingCard}
      />
    </div>
  );
};

export default CreditCards;