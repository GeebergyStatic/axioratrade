import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Context from './Context';
import ErrorBoundary from './components/ErrorBoundary';
import { UserProvider } from './components/UserRoleContext';
import Home from './components/Home';
import Login from './components/Login';
import Loading from './components/Loading';
import PrivateAdmin from './components/PrivateAdmin';
import PrivateTradeHistory from './components/PrivateTradeHistory';
import PrivateDeposit from './components/PrivateDeposit';
import PrivateRoute from './components/PrivateRoute';
import PrivateActivate from './components/PrivateActivate';
import PrivateBalance from './components/PrivateBalance';
import PrivateTx from './components/PrivateTx';
import SignUp from './components/SignUp';
import Navbar from './components/Navbar';
import Deposit from './components/deposit';
import WalletBalance from './components/WalletBalance';
import PaymentModal from './components/PaymentModal';
import TransactionList from './components/Transactions';
import PrivateDashboard from './components/PrivateDashboard';
import Dashboard from './components/dashboard';
import TradesTable from './components/tradeHistory';
import UserManagement from './components/UserManagement';
import ForgotPassword from './components/ForgotPasswordModal';
import ToastProvider from './components/ToastProvider';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const hasPaid = true;


  const initAuthUser = () => {
    const authenticatedUser = localStorage.getItem('auth');
    if (authenticatedUser) {
      setUser(JSON.parse(authenticatedUser));
    }
  };
  return (
    <Context.Provider value={{ isLoading, setIsLoading }}>
      <UserProvider>
        {hasPaid ? (
          <Router>
            <ErrorBoundary>
              <ToastProvider>
                <Navbar />
                <Routes>
                  <Route exact path="/" element={<PrivateRoute exact path="/" element={<Home />} />} />
                  <Route exact path="/login" element={<Login />} />
                  <Route exact path="/signup" element={<SignUp />} />
                  <Route exact path="/forgot-password" element={<ForgotPassword />} />
                  <Route exact path="/withdraw" element={<PrivateBalance exact path="/withdraw" element={<WalletBalance />} />} />
                  <Route exact path="/transactions" element={<PrivateTx exact path="/transactions" element={<TransactionList />} />} />
                  <Route exact path="/deposit" element={<PrivateDeposit exact path="/deposit" element={<Deposit />} />} />
                  <Route exact path="/trade-history" element={<PrivateTradeHistory exact path="/trade-history" element={<TradesTable />} />} />
                  <Route exact path="/investment_plans" element={<PrivateActivate exact path="/investment_plans" element={<PaymentModal />} />} />
                  <Route exact path="/profile" element={<PrivateDashboard exact path="/profile" element={<Dashboard />} />} />
                  <Route exact path="/admin" element={<PrivateAdmin exact path="/admin" element={<UserManagement />} />} />
                </Routes>
              </ToastProvider>
            </ErrorBoundary>
            {isLoading && <Loading />}
          </Router>
        ) : (
          <div>Service is no longer active</div>
        )}
      </UserProvider>
    </Context.Provider>
  );

}

export default App;
