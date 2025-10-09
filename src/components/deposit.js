import React, { useState, useContext, useEffect } from 'react';
import { useUserContext } from './UserRoleContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCopy } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import myRedImage from '../red-loader.gif';
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import PaymentBox from './PaymentBox';
import Loading from './Loading';


const Deposit = () => {
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


    const saveBtcTransactionData = async (email, amount, userID, status, paymentID, username) => {

        const reference = uuidv4();
        const txDetails = {
            transactionReference: `tx-${reference}`,
            email,
            amount,
            userID,
            status, // Include the status field
            timestamp: new Date(),
            transactionType: 'Deposit',
            paymentID,
            username,
            description: 'Deposit',
        };

        try {
            const response = await fetch(`https://axioratrade.onrender.com/api/createTransactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    // Save temp crypto transaction
    const saveTempCryptoData = async (userID, payment_status, pay_address, price_amount, paymentID, username) => {

        const paymentData = {
            userID,
            payment_status,
            pay_address,
            price_amount,
            paymentID,
            username,
            description: 'Deposit',
        };

        try {
            const response = await fetch(`https://axioratrade.onrender.com/api/saveCryptoPayments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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


    const handleFundDropdownChange = (e, amount) => {
        if (fundAmount < 10) {
            toast.warning('Fund amount must be at least $10.', {
                position: toast.POSITION.TOP_CENTER,
                className: 'custom-toast',
            });
            return;
        }
        const selectedOption = e.target.value;
        setSelectedFundValue(selectedOption);

        // Fetch the corresponding wallet address (and memo for tether) based on the selection
        const selectedWallet = walletAddresses.find(wallet => wallet.type === selectedOption);
        setSelectedWallet(selectedWallet);

        if (selectedOption.toLowerCase() === 'xrp' && selectedWallet) {
            setTetherInfo({ usdtAddress: selectedWallet.address, usdtMemo: selectedWallet.memo });
            setFundAddress(null); // Hide the single address input for Tether case
            // handleSaveTransaction(amount);
        } else {
            setFundAddress(selectedWallet ? selectedWallet.address : null);
            setTetherInfo({ usdtAddress: '', usdtMemo: '' });
            // handleSaveTransaction(amount);
        }
    };


    const handleSaveTransaction = (amount) => {
        // Here, you would generate a payment address or save the transaction
        console.log(`Saving transaction for amount: ${amount}`);
        const paymentID = generateTransactionReference(10);

        saveBtcTransactionData(userEmail, amount, userID, 'pending', `pID-${paymentID}`, username);
        saveTempCryptoData(userID, 'pending', 'random', amount, `pID-${paymentID}`, username);
    };



    const generateFundAddress = (amount) => {
        setIsFundBtnLoading(true);
        // Simulating API call
        if (fundAddress) {
            setTimeout(() => {
                setShowAddress(true);
                handleSaveTransaction(amount);
                setIsFundBtnLoading(false);
            }, 2000);
        }
        else {
            setShowAddress(false);
            setIsFundBtnLoading(false);
            toast.warning('Please select a payment method!', {
                position: toast.POSITION.TOP_CENTER,
                className: 'custom-toast',
            });
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
                {/* fund wallet address */}
                <div className='d-flex justify-content-center mb-5 fund-wallet-box'>
                    <div className="payment-modal container-fluid text-secondary" style={{ width: '100%', maxWidth: '300px', backgroundColor: '#f4f4f5', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
                        <div className="mt-3">
                            <h4 className='mb-3 text-center text-dark fw-bold'>Fund your Wallet</h4>
                            {showAddress && fundAddress && (
                                <p className='bold'>Make sure to send the exact amount specified to avoid missing transactions.</p>
                            )}

                            {showAddress && fundAddress ? (
                                <>
                                    <h3 className='text-white display-5'>${fundAmount.toLocaleString()}</h3>
                                    <p>Send your {selectedFundValue.toUpperCase()} to this wallet address:</p>
                                    {selectedWallet && (
                                        <div className="wallet-info p-3 text-center rounded border-gradient">
                                            {selectedWallet.url && (
                                                <img src={selectedWallet.url} alt="QR Code" className="qr-code img-fluid" />
                                            )}

                                            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between mt-3">
                                                <span className="wallet-address">
                                                    {selectedWallet.address.slice(0, 6)}...{selectedWallet.address.slice(-4)}
                                                </span>
                                                <button type="button" className="btn btn-sm copy-btn" onClick={copyToClipboard}>
                                                    <FontAwesomeIcon icon={faCopy} /> Copy
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {/* <div className='d-flex align-items-center justify-content-between'>
                  <input className='bg-light-sec border border-secondary p-2 rounded' type="text" readOnly value={fundAddress} />
                  <button className='remove-btn-style' onClick={() => handleCopyFund(fundAddress)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-copy text-theme mx-2" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" />
                      <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
                    </svg>
                  </button>
                </div> */}
                                </>
                            ) : tetherInfo.usdtAddress ? (
                                <>
                                    <p>Amount: <span className='fw-bold text-white'>${fundAmount}</span></p>
                                    <p>Send your Tether to the following address:</p>
                                    <div className='d-flex align-items-center justify-content-between mb-2'>
                                        <input className='bg-light-sec border border-secondary p-2 rounded' type="text" readOnly value={tetherInfo.usdtAddress} placeholder="USDT Address" />
                                        <button className='remove-btn-style' onClick={() => handleCopyFund(tetherInfo.usdtAddress)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-copy text-theme mx-2" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" />
                                                <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p>Memo:</p>
                                    <div className='d-flex align-items-center justify-content-between mb-2'>
                                        <input className='bg-light-sec border border-secondary p-2 rounded' type="text" readOnly value={tetherInfo.usdtMemo} placeholder="USDT Memo" />
                                        <button className='remove-btn-style' onClick={() => handleCopyFund(tetherInfo.usdtMemo)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-copy text-theme mx-2" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" />
                                                <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        className='form-control p-2 w-100'
                                        value={fundAmount}
                                        onChange={(e) => setFundAmount(e.target.value)}
                                    />

                                    {/* Funding option dropdown */}
                                    <div className='mt-3'>
                                        <select className='form-control' value={selectedFundValue} onChange={(e) => handleFundDropdownChange(e, fundAmount)}>
                                            <option value="">Select Payment Option</option>
                                            {(Array.isArray(walletAddresses) ? walletAddresses : []).map(wallet => (
                                                <option key={wallet.type} value={wallet.type}>
                                                    {wallet.type.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>


                                    </div>
                                </>
                            )}

                            {!showAddress && tetherInfo.usdtAddress === '' && (
                                <button
                                    className="paystack-button w-100 mt-4"
                                    onClick={() => generateFundAddress(fundAmount)}
                                    disabled={isFundBtnLoading}
                                >
                                    {isFundBtnLoading ? (
                                        <Spinner animation="border" size="md" className="text-white" />
                                    ) : (
                                        'Make a deposit'
                                    )}
                                </button>
                            )}

                            {/* Deposit with bank option */}
                            {/* <div className='mt-3 text-center'>
                                <a className="text-dark" href="mailto:support@axiortrade.com">Send us an email</a> to deposit with your bank.
                            </div> */}
                        </div>
                    </div>
                </div>

            </div>


        </div>
    );
};

export default Deposit;
