import React, { useState, useEffect } from 'react';
import { useUserContext } from './UserRoleContext';
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
import 'font-awesome/css/font-awesome.min.css'; // Import Font Awesome CSS

const TransactionList = () => {
  const { userData } = useUserContext();
  const [userTransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const userID = userData?.userID; // Ensure userID exists

  useEffect(() => {
    // Fetch the user's transactions when the component mounts
    if (userID) fetchUserTransactions(userID);
  }, [userID]);

  const fetchUserTransactions = async (userID) => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await fetch(
        `https://axioratrade.onrender.com/api/getUserTransactions?userID=${userID}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const userTransactionsData = await response.json();
      // Sort transactions in descending order based on a timestamp field
      userTransactionsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setUserTransactions(userTransactionsData);
    } catch (error) {
      console.error('Error fetching user transactions: ', error);
      toast.error("Failed to fetch transactions. Please try again later.", {
        className: 'custom-toast',
      });
    } finally {
      setLoading(false); // Set loading to false after fetch
    }
  };

  return (
    <div className='container-fluid' style={{ background: '#f4f4f5', height: '100%', width: '100%', position: 'absolute', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '80px' }}>
      <div className="transaction-list p-4 rounded shadow-lg" style={{
        maxWidth: '900px',
        marginLeft: '19%',
        background: '#f4f4f5',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
      }}>
        <h2 className="text-center text-dark mb-4" style={{ borderBottom: '2px solid #3A7BD5', paddingBottom: '10px' }}>
          Your Transactions
        </h2>
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" size="md" className="text-white" />
            <p className="text-light mt-3">Loading Transactions...</p>
          </div>
        ) : (
          <>
            {userTransactions.length === 0 ? (
              <p className="text-center text-light">No transactions found.</p>
            ) : (
              userTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className={`transaction-item p-3 mt-3 rounded d-flex flex-column shadow-sm ${transaction.status === 'success' ? 'border border-success text-success' :
                    transaction.status === 'pending' ? 'border border-warning text-warning' :
                      'border border-danger text-danger'
                    }`}
                  style={{
                    background: '#f4f4f5',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease-in-out',
                    padding: '15px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ wordBreak: 'break-word' }}>
                    <span className="fw-bold text-dark">Transaction Reference:</span>
                    <span className="text-dark" style={{ textWrap: 'wrap' }}>{transaction.transactionReference}</span>
                  </div>
                  <div className="transaction-description text-dark fw-semibold mt-2">{transaction.description}</div>
                  <div className="transaction-details d-flex justify-content-between align-items-center mt-3 p-2" style={{ borderTop: '1px solid #444' }}>
                    <span className={`fw-bold ${transaction.status === 'success' ? 'text-success' : transaction.status === 'pending' ? 'text-warning' : 'text-danger'}`}>
                      {transaction.status === 'success' ? 'Transaction Successful' : transaction.status === 'pending' ? 'Pending' : 'Failed'}
                    </span>
                    <span className={`fw-bold ${transaction.status === 'success' ? 'text-success' : transaction.status === 'pending' ? 'text-warning' : 'text-danger'}`}>
                      <span>${transaction.amount}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>);
};

export default TransactionList;
