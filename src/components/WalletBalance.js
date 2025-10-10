import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Accordion, Button, Table } from 'react-bootstrap';
import { useUserContext } from './UserRoleContext';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, getFirestore, collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import BtcWithdrawList from './btcWithdraw';
import "react-toastify/dist/ReactToastify.css";
import myRedImage from '../red-loader.gif';
import Loading from './Loading';
import getSymbolFromCurrency from 'currency-symbol-map';





const WalletBalance = (props) => {
  const { userData, currentUser } = useUserContext();
  const userID = userData.userID;
  const username = userData.fullName;
  const userBalance = userData.profit;
  const userEmail = userData.email;
  const userDeposit = userData.deposit;
  const currencySymbol = userData.currencySymbol;

  const user = auth.currentUser;

  const [isLoading, setIsLoading] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [txReference, setTxReference] = useState('');
  const [bankList, setBankList] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [inUseReference, setInUseReference] = useState('');
  const [transferResponse, setTransferResponse] = useState('');
  const [isBtnDisabled, setIsBtnDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [fundAmount, setFundAmount] = useState(null);

  // Example non-decimal number
  // State to manage the selected value of the dropdown
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedStarterValue, setSelectedStarterValue] = useState('');
  const [memoTag, setMemoTag] = useState('');

  function formatCurrency(amount, currencyCode = 'USD', locale = 'en-US') {
    if (amount === null || amount === undefined) amount = 0;

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // fallback if currency code is invalid
      const symbol = getSymbolFromCurrency(currencyCode) || '';
      return `${symbol}${Number(amount).toLocaleString(locale, { minimumFractionDigits: 2 })}`;
    }
  }

  const generateTransactionReference = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let customReference = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      customReference += characters[randomIndex];
    }
    return customReference;
  }

  const [paymentAddress, setPaymentAddress] = useState('');
  const formattedBalance = (Number(userBalance) + 0.0).toFixed(2);


  //  save crypto transaction (deposit)
  //  save crypto transaction (deposit)
  const saveBtcTransactionData = async (email, amount, userID, status, paymentID, username) => {
    // const db = getFirestore();
    // const transactionsCollection = collection(db, 'transactions');
    const txReference = generateTransactionReference(10); // Assuming you want a reference of length 10

    if (user) {
      const txDetails = {
        transactionReference: 'tx-' + txReference,
        email,
        amount,
        userID,
        status, // Include the status field
        timestamp: new Date(),
        transactionType: 'Withdrawal',
        paymentID,
        username,
        description: 'Withdrawal',
      };
      await fetch(`https://axioratrade.onrender.com/api/createTransactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any other headers as needed
          },
          body: JSON.stringify(txDetails),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          try {

          } catch (error) {
            console.log('Error adding transaction document: ', JSON.stringify(error));
          }
        })
        .catch(error => {
          console.log('Error:', JSON.stringify(error.message));
        });
    }

  };
  // end of crypto tx record

  // save temp crypto tx
  const saveTempCryptoData = async (userID, payment_status, pay_address, price_amount, paymentID, username) => {
    // const db = getFirestore();
    // const transactionsCollection = collection(db, 'transactions');
    // const txID = uuidv4(); 
    if (user) {
      const paymentData = {
        userID,
        payment_status,
        pay_address,
        price_amount,
        paymentID,
        username,
        description: 'Withdrawal',
      };
      await fetch(`https://axioratrade.onrender.com/api/saveCryptoPayments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any other headers as needed
          },
          body: JSON.stringify(paymentData),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

        })
        .then(data => {
          try {


          } catch (error) {

          }
        })
        .catch(error => {

        });
    }

  };

  const handleDebitUser = async (amount) => {
    if (userBalance && amount && userBalance >= amount) {
      try {
        const response = await axios.post(
          'https://axioratrade.onrender.com/api/debitUser',
          {
            userId: userID,
            fee: parseFloat(amount), // Ensure fee is a number
          }
        );

        if (response.status === 200) {
          return true; // Indicate success
        } else {
          throw new Error('Failed to debit user.');
        }
      } catch (err) {
        console.error('Error debiting user:', err);
        throw new Error('Error debiting user.');
      }
    } else {
      throw new Error('Insufficient Funds!');
    }
  };


  // Function to handle the change of the dropdown value
  const handleDropdownChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleCryptoDropdownChange = (event) => {
    setSelectedStarterValue(event.target.value);
  };


  const completeBtcPayment = async () => {
    setIsLoading(true);
    setIsBtnDisabled(true);

    try {
      // Validation checks
      if (selectedValue.trim() === '') {
        throw new Error('Select a withdrawal option!');
      }
      if (selectedStarterValue === 'xrp' && memoTag.trim() === '') {
        throw new Error('Invalid memo tag!');
      }
      if (userBalance < amount) {
        throw new Error('Insufficient Funds!');
      }
      if (amount < 20) {
        throw new Error('Minimum withdrawal is $20!');
      }
      if (selectedValue === 'crypto' && selectedStarterValue.trim() === '') {
        throw new Error('Select a cryptocurrency!');
      }
      if (userAddress.trim() === '') {
        throw new Error('Receiving account field cannot be empty!');
      }
      if (userDeposit < 1) {
        throw new Error('To withdraw, you must first fund your account with at least 10% of the withdrawal amount!');
      }

      // Debit user
      await handleDebitUser(amount);

      // Save transaction data
      const paymentID = generateTransactionReference(10);
      await saveBtcTransactionData(userEmail, amount, userID, 'pending', `pID-${paymentID}`, username);
      await saveTempCryptoData(userID, 'pending', 'random', amount, `pID-${paymentID}`, username);

      // Success notification
      toast.success('Withdrawal request submitted successfully!', {
        toastId: 'toast-wt-success',
        className: 'custom-toast',
      });

      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      // Error notification
      toast.error(error.message, {
        toastId: 'toast-wt-error',
        className: 'custom-toast',
      });
    } finally {
      // Reset loading and button state
      setIsLoading(false);
      setIsBtnDisabled(false);
    }
  };




  return (
    <div className='container-fluid' style={{ background: '#f4f4f5', height: '100%', width: '100%', position: 'absolute', overflowY: 'auto', overflowX: 'hidden', marginBottom: '80px' }}>
      {/* <ToastContainer /> */}
      {/* User Details */}
      <Row className="mt-4" style={{ maxWidth: '900px', marginLeft: '18%' }}>
        <h4 className='text-secondary'>Withdrawals</h4>
        <Col>
          <Card className='text-dark fw-bolder' style={{ background: '#f4f4f5', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)' }}>
            <Card.Body>
              <Card.Title>Net balance: <span className='text-dark'>
                {formatCurrency(userDeposit, currencySymbol)}
              </span>
              </Card.Title>
              <Card.Text>

              </Card.Text>
            </Card.Body>
          </Card>
          {/*  */}
          <Card className='text-dark mt-4 mb-3 fw-bold' style={{ background: '#f4f4f5', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)' }}>
            <Card.Body>
              <Card.Title>Make withdrawals</Card.Title>
              <Card.Text>
                <>

                  {selectedValue === 'crypto' && <p className='text-danger'>Make sure to paste a {selectedStarterValue} wallet address!</p>}


                  {/* select withdrawal from */}
                  <div>
                    <select className='form-control mt-4' id="myDropdown" value={selectedValue} onChange={handleDropdownChange}>
                      <option value="">Select Withdrawal Option</option>
                      <option value="bank">Withdraw to bank</option>
                      <option value="crypto">Withdraw to wallet</option>
                    </select>
                  </div>

                  {/* amount form */}
                  <div>
                    <input
                      type="number"
                      value={amount}
                      placeholder='Amount'
                      onChange={(e) => setAmount(e.target.value)}
                      className='form-control mt-4'
                    />
                  </div>



                  {/* paste address form */}
                  {selectedValue === 'crypto' &&
                    <>

                      <div className='mt-1'>
                        <select className='form-control mt-4 mb-3' id="myCryptoDropdown" value={selectedStarterValue} onChange={handleCryptoDropdownChange}>
                          <option value="">Select Payment Option</option>
                          <option value="btc">Bitcoin</option>
                          <option value="eth">Ethereum</option>
                          <option value="xrp">Ripple</option>
                        </select>
                      </div>

                      {selectedStarterValue === 'xrp' &&
                        <div>
                          <input
                            type="text"
                            value={memoTag}
                            placeholder='Your XRP memo tag'
                            onChange={(e) => setMemoTag(e.target.value)}
                            className='form-control mt-4'
                          />
                        </div>
                      }
                    </>
                  }

                  {selectedValue.trim() !== '' &&
                    <div>
                      <input
                        type="text"
                        value={userAddress}
                        placeholder={`${selectedValue === 'crypto' && selectedValue.trim() !== '' ? `Paste your ${selectedStarterValue} wallet address` : 'Bank Name'}`}
                        onChange={(e) => setUserAddress(e.target.value)}
                        className='form-control mt-4'
                      />
                    </div>
                  }
                  {selectedValue === 'bank' &&
                    <>
                      <div>
                        <input
                          type="text"
                          placeholder='Account Name'
                          className='form-control mt-4'
                        />
                      </div>
                      {/* account number */}
                      <div>
                        <input
                          type="number"
                          placeholder='Account Number'
                          className='form-control mt-4'
                        />
                      </div>
                      {/* routing number */}
                      <div>
                        <input
                          type="number"
                          placeholder='Routing Number'
                          className='form-control mt-4'
                        />
                      </div>
                    </>
                  }

                  {/* withdraw button */}
                  <button
                    onClick={completeBtcPayment}
                    className={`btn-theme text-center mx-auto mb-5 mt-4 ${isBtnDisabled ? 'disabled' : ''}`}
                  >
                    {isBtnDisabled ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      'Withdraw'
                    )}
                  </button>
                  <br />
                  {selectedValue === 'crypto' && <>
                    <span className='fw-bold text-white'>Don't have a crypto wallet address?</span> <br />
                    <a href='https://www.coinbase.com/' className='text-white'>Open a coinbase account</a> <br />
                    <a href='https://www.blockchain.com/' className='text-white'>Open a blockchain account</a>
                  </>}
                </>
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className='text-dark mt-4 mb-3' style={{ background: '#f4f4f5', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)' }}>
            <Card.Text className='p-5'>
              <p>
                Please note: Before approving a withdrawal request, you may be required to submit proof of identity and address of the requester. Withdrawal fees will be applied, based on type of trading account and acceptable withdrawal method. Withdrawals are normaly processed, using the same method as deposit was done. For security reasons, withdrawal requests to ewallets, bank and creditcard accounts, not belonging to a trading account owner are denied. Please refer to terms and conditions for more information.
              </p>
            </Card.Text>
          </Card>
        </Col>
      </Row>

      {isLoading && <Loading />}
    </div>
  );

};

export default WalletBalance;
