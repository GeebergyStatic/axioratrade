import React, { useState, useEffect } from 'react';
import { useUserContext } from './UserRoleContext';
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from "react-bootstrap";
import axios from 'axios';

const BtcTaskList = () => { // Rename the function to start with an uppercase letter
  const { userData, currentUser } = useUserContext();
  const agentID = userData.agentID;
  const [tasks, setTasks] = useState([]);
  const [btcTx, setBtcTx] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPendingBtcDeposits(agentID);
  }, []);

  const fetchPendingBtcDeposits = async (agentID) => {
    try {
      const response = await axios.get(`https://axioratrade-8pb9.onrender.com/api/getBtcDeposits/${agentID}`);
      const transactions = response.data; // axios automatically parses JSON responses
      setBtcTx(transactions);
    } catch (error) {
      console.error('Error fetching BTC deposits:', error.message);
    }
  };

  // const fetchPendingBtcDeposits = async () => {
  //   try {
  //     const response = await axios.get(`https://axioratrade-8pb9.onrender.com/api/getBtcDeposits`);
  //     const transactions = response.data; // axios automatically parses JSON responses
  //     setBtcTx(transactions);
  //   } catch (error) {
  //     console.error('Error fetching BTC deposits:', error.message);
  //   }
  // };


  // change state of btc tasks (transactions and temp data);
  const changePaymentStatus = async (transactionId, newStatus, userId, amount, txId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://axioratrade-8pb9.onrender.com/api/updatePaymentStatusAndDelete/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newStatus, userId, amount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // If the request is successful, call another function
      toast.success(`Documents Updated!`, {
        toastId: 'toast-change-success',
        className: 'custom-toast',
      });
      setIsLoading(false);
      setBtcTx(btcTx.filter(tx => tx._id !== txId)); // Remove from UI after update
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(`Failed to update documents!`, {
        toastId: 'toast-change-failed',
        className: 'custom-toast',
      });
      setIsLoading(false);
    }
  };


  return (
    <div className='text-start'>
      {/* <ToastContainer /> */}
      <h1 className='text-white'>Crypto Deposit Requests</h1>
      <span className='text-warning mb-1'><FontAwesomeIcon className='mx-2' icon={faInfoCircle} />This is where all your clients' pending deposits are. You can approve it or deny it and it would show up as transaction successful or denied on their side depending on what you choose!</span>
      <div className="custom-task-list d-block">
        <>
          {btcTx.map((tx) => (
            <div key={tx.id} className="custom-task-card text-dark">
              {/* Display transaction details */}
              <p><span className='fw-bold'>Transaction ID:</span> {tx.paymentID}</p>
              <p><span className='fw-bold'>Amount:</span> {tx.price_amount}</p>
              <p><span className='fw-bold'>Status:</span> {tx.payment_status}</p>
              <p><span className='fw-bold'>User ID:</span> {tx.userID}</p>
              <p><span className='fw-bold'>Username:</span> {tx.username}</p>
              <p><span className='fw-bold'>Time of payment:</span>{new Date(tx.timestamp).toLocaleDateString()}</p>
              <p><span className='fw-bold'>Payment Description:</span> {tx.description}</p>

              {/* Buttons to change payment status */}
              {isLoading ? (
                <Spinner animation="border" size="sm" variant="primary" />
              ) : (
                <div className='d-flex justify-content-between align-items-center'>
                  <button className='btn btn-success' onClick={() => changePaymentStatus(tx.paymentID, 'success', tx.userID, tx.price_amount, tx._id)}>Mark as Approved</button>
                  <button className='btn btn-danger' onClick={() => changePaymentStatus(tx.paymentID, 'failed', tx.userID, tx.price_amount, tx._id)}>Mark as Declined</button>
                </div>
              )}
            </div>
          ))}
        </>
      </div>
    </div>
  );
};

export default BtcTaskList;
