import React, { useState, useContext, useEffect } from 'react';
import { useUserContext } from './UserRoleContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import myRedImage from '../red-loader.gif';
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import PaymentBox from './PaymentBox';
import Loading from './Loading';


const PaymentModal = () => {
  const { userData, currentUser } = useUserContext();
  const userEmail = userData.email;
  const userID = userData.userID;
  const username = userData.fullName;
  const agentCode = userData.agentCode;
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [selectedFundValue, setSelectedFundValue] = useState('');
  const [fundAddress, setFundAddress] = useState(null);
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [tetherInfo, setTetherInfo] = useState({ usdtAddress: '', usdtMemo: '' });
  const [isFundBtnLoading, setIsFundBtnLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDebitingStarter, setIsDebitingStarter] = useState(false);
  const [isDebitingGold, setIsDebitingGold] = useState(false);
  const [isDebitingProfessional, setIsDebitingProfessional] = useState(false);
  const [isDebitingExpert, setIsDebitingExpert] = useState(false);

  useEffect(() => {
    if (!agentCode) return; // Ensure agentCode is available before making the request

    fetch(`https://axioratrade.onrender.com/api/fetchWallets?agentCode=${agentCode}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWalletAddresses(data);
        } else {
          setWalletAddresses([]); // Fallback if response is not an array
        }
      })
      .catch(err => {
        console.error('Failed to fetch wallet addresses:', err);
        setWalletAddresses([]);
      });
  }, [agentCode]); // Add agentCode as a dependency to re-fetch if it changes


  const generateTransactionReference = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let customReference = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      customReference += characters[randomIndex];
    }
    return customReference;
  }


  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedWallet.address);
    toast.info("Address copied to clipboard!", {
      position: "top-right",
      className: "custom-toast",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  };


  // Map amounts to plan names
  const planMap = {
    10000: 'Expert',
    5000: 'Professional',
    2000: 'Gold',
    1000: 'Starter',
  };

  // Save BTC transaction with plan info
  const saveBtcTransactionData = async (email, amount, userID, status, paymentID, username) => {
    const selectedPlan = planMap[amount] || null;

    const reference = uuidv4();
    const txDetails = {
      transactionReference: `tx-${reference}`,
      email,
      amount,
      userID,
      status,
      timestamp: new Date(),
      transactionType: 'Deposit',
      paymentID,
      username,
      description: 'Deposit',
      plan: selectedPlan, // Added plan field
    };

    try {
      const response = await fetch(`https://axioratrade.onrender.com/api/createTransactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txDetails),
      });

      if (!response.ok) {
        throw new Error(`Failed to save BTC transaction: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('BTC transaction saved successfully:', data);
    } catch (error) {
      console.error('Error saving BTC transaction:', error.message);
    }
  };

  // Save temporary crypto transaction with plan info
  const saveTempCryptoData = async (userID, payment_status, pay_address, price_amount, paymentID, username) => {
    const selectedPlan = planMap[price_amount] || null;

    const paymentData = {
      userID,
      payment_status,
      pay_address,
      price_amount,
      paymentID,
      username,
      description: 'Deposit',
      plan: selectedPlan, // Added plan field
    };

    try {
      const response = await fetch(`https://axioratrade.onrender.com/api/saveCryptoPayments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save crypto payment: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Crypto payment saved successfully:', data);
    } catch (error) {
      console.error('Error saving crypto payment:', error.message);
    }
  };

  // Unified function to handle saving transactions
  const handleSaveTransaction = (amount) => {
    const paymentID = generateTransactionReference(10);

    saveBtcTransactionData(userEmail, amount, userID, 'pending', `pID-${paymentID}`, username);
    saveTempCryptoData(userID, 'pending', 'random', amount, `pID-${paymentID}`, username);
  };


  const handleDebitUser = async (amount) => {
    const user_balance = userData?.deposit ?? 0;

    // Validate amount
    if (!amount || amount <= 0) {
      return toast.warning('Please enter a valid amount.', {
        toastId: 'toast-invalid-amount',
        className: 'custom-toast',
      });
    }

    // Check balance
    if (user_balance < amount) {
      return toast.error('Insufficient funds!', {
        toastId: 'toast-insufficient',
        className: 'custom-toast',
      });
    }

    // Define plan mapping (easy to modify later)
    const planMap = {
      10000: { name: 'Expert', setLoading: setIsDebitingExpert },
      5000: { name: 'Professional', setLoading: setIsDebitingProfessional },
      2000: { name: 'Gold', setLoading: setIsDebitingGold },
      1000: { name: 'Starter', setLoading: setIsDebitingStarter },
    };

    const plan = planMap[amount] || { name: 'Unknown', setLoading: () => { } };
    plan.setLoading(true);

    try {
      const { data, status } = await axios.post(
        'https://axioratrade.onrender.com/api/debitUser',
        {
          userId: userID,
          fee: parseFloat(amount),
          plan: plan.name, // ✅ Include the plan name
        }
      );

      if (status === 200 && data?.message?.includes('successfully')) {
        toast.success(`Transaction successful! ${plan.name} plan activated. 🎉`, {
          toastId: 'toast-debit-success',
          className: 'custom-toast',
        });

        // Optionally update frontend balance
        // setUserData((prev) => ({ ...prev, deposit: prev.deposit - amount }));
      } else {
        toast.error(data?.error || 'Transaction failed. Please try again.', {
          toastId: 'toast-debit-failed',
          className: 'custom-toast',
        });
      }
    } catch (err) {
      console.error('Error debiting user:', err);
      toast.error('Something went wrong. Try again later.', {
        toastId: 'toast-debit-error',
        className: 'custom-toast',
      });
    } finally {
      plan.setLoading(false);
    }
  };



  const handleCopyFund = (value) => {
    navigator.clipboard.writeText(value);
    // Optionally, add a toast notification here
    toast.info('Info Copied Successfully!', {
      position: toast.POSITION.TOP_CENTER,
      className: 'custom-toast',
    });
  };

  return (
    <div className="payment-container" style={{ background: '#f4f4f5', overflowY: 'auto', padding: '20px' }}>
      {/* <ToastContainer /> */}


      <div className='container-custom' style={{ marginLeft: '20%', padding: '20px' }}>

        {/* Investment Plans */}
        <div className='payment-box-container'>
          <div className="payment-box">
            <PaymentBox
              title="Starter Plan"
              amount={1000}
              saveCryptoTransaction={() => handleSaveTransaction(1000)}
              debitUser={() => handleDebitUser(1000)}
              paymentType={{ walletAddresses }}
              isDebiting={isDebitingStarter}
              perks={<>
                <li className="mb-2">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    style={{ color: "#3A7BD5", marginRight: "8px" }}
                  />
                  Low minimum deposit
                </li>
                <li className="mb-2">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    style={{ color: "#3A7BD5", marginRight: "8px" }}
                  />
                  Instant trade execution
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    style={{ color: "#3A7BD5", marginRight: "8px" }}
                  />
                  Access to basic analytics
                </li>
              </>}
            />
          </div>

          <div className="payment-box">
            <PaymentBox
              title="Gold Plan"
              amount={2000}
              saveCryptoTransaction={() => handleSaveTransaction(2000)}
              debitUser={() => handleDebitUser(2000)}
              paymentType={{ walletAddresses }}
              isDebiting={isDebitingGold}
              perks={
                <>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    Priority trade execution
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    Advanced charting tools
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    Dedicated account manager
                  </li>
                </>
              }
            />
          </div>

          <div className="payment-box">
            <PaymentBox
              title="Professional Plan"
              amount={5000}
              saveCryptoTransaction={() => handleSaveTransaction(5000)}
              debitUser={() => handleDebitUser(5000)}
              paymentType={{ walletAddresses }}
              isDebiting={isDebitingProfessional}
              perks={
                <>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    Exclusive trading signals
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    Zero withdrawal fees
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    Strategy sessions with experts
                  </li>
                </>
              }
            />
          </div>

          <div className="payment-box">
            <PaymentBox
              title="Expert Plan"
              amount={10000}
              saveCryptoTransaction={() => handleSaveTransaction(10000)}
              debitUser={() => handleDebitUser(10000)}
              paymentType={{ walletAddresses }}
              isDebiting={isDebitingExpert}
              perks={
                <>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    VIP priority withdrawals
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    Private portfolio management
                  </li>
                  <li>
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ color: "#3A7BD5", marginRight: "8px" }}
                    />
                    Direct access to senior analysts
                  </li>
                </>
              }
            />
          </div>
        </div>

      </div>


    </div>
  );
};

export default PaymentModal;
