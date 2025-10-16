// PaymentBox.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCopy } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";

const PaymentBox = ({
  title,
  amount,
  saveCryptoTransaction,
  debitUser,
  paymentType,
  isDebiting,
  perks
}) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedValue, setSelectedValue] = useState('');
  const [paymentAddress, setPaymentAddress] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [tetherInfo, setTetherInfo] = useState({ usdtAddress: '', usdtMemo: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  const generatePaymentAddress = async (amount) => {
    setIsBtnLoading(true); // Show loading spinner

    // Map amounts to plan names (same as handleDebitUser)
    const planMap = {
      10000: 'Expert',
      5000: 'Professional',
      2000: 'Gold',
      1000: 'Starter',
    };

    const selectedPlan = planMap[amount] || null;

    if (!paymentAddress) {
      setShowAddress(false);
      setIsBtnLoading(false);
      return toast.warning('Please select a payment method!', {
        position: toast.POSITION.TOP_CENTER,
        className: 'custom-toast',
      });
    }

    try {
      // Simulate API call
      setTimeout(() => {
        setShowAddress(true);

        // Save transaction with plan info
        saveCryptoTransaction(amount, selectedPlan);

        setIsBtnLoading(false);
        toast.success(`Payment address generated for ${selectedPlan || 'Unknown'} plan.`, {
          position: toast.POSITION.TOP_CENTER,
          className: 'custom-toast',
        });
      }, 1500);
    } catch (err) {
      console.error('Error generating payment address:', err);
      setIsBtnLoading(false);
      toast.error('Failed to generate payment address. Try again.', {
        position: toast.POSITION.TOP_CENTER,
        className: 'custom-toast',
      });
    }
  };


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


  const handleDropdownChange = (e) => {
    const selectedOption = e.target.value;
    setSelectedValue(selectedOption);

    // Handle Tether separately
    if (selectedOption === 'xrp') {
      // Assuming you have access to the walletAddresses data here
      // You might need to pass it as a prop or manage it via context/state
      // For simplicity, let's assume it's passed as a prop or available globally
      const selectedWallet = paymentType.walletAddresses.find(wallet => wallet.type === selectedOption);
      setSelectedWallet(selectedWallet);
      if (selectedWallet) {
        setTetherInfo({ usdtAddress: selectedWallet.address, usdtMemo: selectedWallet.memo });
        setPaymentAddress(null);
        // saveCryptoTransaction(amount);
      }
    } else {
      const selectedWallet = paymentType.walletAddresses.find(wallet => wallet.type === selectedOption);
      setSelectedWallet(selectedWallet);
      setPaymentAddress(selectedWallet ? selectedWallet.address : null);
      setTetherInfo({ usdtAddress: '', usdtMemo: '' });
      // saveCryptoTransaction(amount);
    }
  };

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    // Optionally, add a toast notification here
    toast.info('Info Copied Successfully!', {
      position: toast.POSITION.TOP_CENTER,
      className: 'custom-toast',
    });
  };

  return (
    <div className="payment-modal container-fluid text-secondary my-3" style={{ width: '100%', maxWidth: '300px', backgroundColor: '#f4f4f5', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
      {/* <ToastContainer /> */}
      <h2 className='text-dark gradient-text'>{title}</h2>
      <span className='d-flex align-items-start justify-content-center mb-3'>
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="currentColor" className="mx-2 text-secondary bi bi-info-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
        </svg>
        <p>Investment Plan</p>
      </span>
      <h3 className='display-5' style={{ color: '#3A7BD5' }}>${amount.toLocaleString()}</h3>
      {!showAddress && <ul class="list-unstyled text-start mt-3">{perks}</ul>}

      <div>

        {/* Payment Option Dropdown */}
        {!showAddress && tetherInfo.usdtAddress === '' && (
          <div className='mt-1'>
            <select className='form-control mt-4 mb-3' value={selectedValue} onChange={handleDropdownChange}>
              <option value="">Select Payment Option</option>
              {paymentType.walletAddresses && Array.isArray(paymentType.walletAddresses) ? (
                paymentType.walletAddresses.map(wallet => (
                  <option key={wallet.type} value={wallet.type}>
                    {wallet.type.toUpperCase()}
                  </option>
                ))
              ) : (
                <option value="">No Wallet Addresses Available</option> // Fallback option
              )}
            </select>

          </div>
        )}

        {/* Display Payment Address */}
        {showAddress && paymentAddress && (
          <>
            <p className='bold'>Make sure to send the exact amount specified to avoid missing transactions.</p>
            <p>Send your {selectedValue.toUpperCase()} to this wallet address:</p>
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
              <input className='bg-light-sec border border-secondary p-2 rounded' type="text" readOnly value={paymentAddress} />
              <button className='remove-btn-style' onClick={() => handleCopy(paymentAddress)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-copy text-theme mx-2" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" />
                  <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
                </svg>
              </button>
            </div> */}
          </>
        )}

        {/* Display Tether Address and Memo */}
        {showAddress && tetherInfo.usdtAddress && (
          <>
            <p>Send your Tether (USDT) to the following address:</p>
            <div className='d-flex align-items-center justify-content-between mb-2'>
              <input className='bg-light-sec border border-secondary p-2 rounded' type="text" readOnly value={tetherInfo.usdtAddress} placeholder="USDT Address" />
              <button className='remove-btn-style' onClick={() => handleCopy(tetherInfo.usdtAddress)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-copy text-theme mx-2" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" />
                  <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
                </svg>
              </button>
            </div>
            <p>Memo:</p>
            <div className='d-flex align-items-center justify-content-between mb-2'>
              <input className='bg-light-sec border border-secondary p-2 rounded' type="text" readOnly value={tetherInfo.usdtMemo} placeholder="USDT Memo" />
              <button className='remove-btn-style' onClick={() => handleCopy(tetherInfo.usdtMemo)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-copy text-theme mx-2" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6Z" />
                  <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {errorMessage && <p className="text-danger">{errorMessage}</p>}

        {/* Action Buttons */}
        {!showAddress && tetherInfo.usdtAddress === '' && (
          <div className='d-flex-column justify-content-between mt-3 '>
            <button
              className="paystack-button mb-3 mx-2 text-white"
              onClick={() => generatePaymentAddress(amount)}
              disabled={isBtnLoading}
            >
              {isBtnLoading ? (
                <Spinner animation="border" size="md" className="text-white" />
              ) : (
                'Make Payment'
              )}
            </button>
            <button
              className={isBtnLoading ? 'd-none' : 'text-white p-2 btn btn-secondary'}
              onClick={() => debitUser(amount)}
              disabled={isBtnLoading}
            >
              {isDebiting ? (
                <Spinner animation="border" size="md" className="text-white" />
              ) : (
                'Pay from balance'
              )}
            </button>
          </div>
        )}

        {/* Deposit with Bank */}
        {/* <div className='mt-3 text-end'>
          <a className='text-dark' href="mailto:support@axioratrade.com">Send us an email</a> to deposit with your bank.
        </div> */}
      </div>
    </div>
  );
};

export default PaymentBox;
