import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ProfileModal } from './components/profile/ProfileModal';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { Goals } from './components/Goals';
import { Reports } from './components/Reports';
import { Button } from './components/ui/Button';
import { Transaction, Goal } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Plus } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('vof-transactions', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('vof-goals', []);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleEditTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!editingTransaction) return;
    
    const updatedTransaction: Transaction = {
      ...transactionData,
      id: editingTransaction.id,
      createdAt: editingTransaction.createdAt,
    };
    
    setTransactions(transactions.map(t => 
      t.id === editingTransaction.id ? updatedTransaction : t
    ));
    setEditingTransaction(undefined);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleOpenEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionFormOpen(true);
  };

  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setGoals([newGoal, ...goals]);
  };

  const handleEditGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleTransactionFormClose = () => {
    setIsTransactionFormOpen(false);
    setEditingTransaction(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
            <Dashboard transactions={transactions} goals={goals} />
            <div className="fixed bottom-6 right-6">
              <Button
                onClick={() => setIsTransactionFormOpen(true)}
                className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </>
        )}
        
        {activeTab === 'transactions' && (
          <>
            <TransactionList
              transactions={transactions}
              onEdit={handleOpenEditTransaction}
              onDelete={handleDeleteTransaction}
            />
            <div className="fixed bottom-6 right-6">
              <Button
                onClick={() => setIsTransactionFormOpen(true)}
                className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </>
        )}
        
        {activeTab === 'goals' && (
          <Goals
            goals={goals}
            onAdd={handleAddGoal}
            onEdit={handleEditGoal}
            onDelete={handleDeleteGoal}
          />
        )}
        
        {activeTab === 'reports' && (
          <Reports transactions={transactions} />
        )}
      </main>

      <TransactionForm
        isOpen={isTransactionFormOpen}
        onClose={handleTransactionFormClose}
        onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
        editingTransaction={editingTransaction}
      />
      
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;