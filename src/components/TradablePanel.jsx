// TradablePanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { useUserContext } from './UserRoleContext';

const TradablePanel = ({
    apiSymbolsUrl,
}) => {
    const [symbols, setSymbols] = useState([]);
    const [selectedSymbol, setSelectedSymbol] = useState('');
    const [investAmount, setInvestAmount] = useState('');
    const [leverage, setLeverage] = useState('');
    const [expiration, setExpiration] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingSymbols, setIsLoadingSymbols] = useState(false);
    const { userData } = useUserContext();
    const userId = userData.userID;
    const currencySymbol = userData.currencySymbol;

    useEffect(() => {
        const fetchSymbols = async () => {
            try {
                console.log('Checking cache...');
                const cached = localStorage.getItem('symbols');
                if (cached) {
                    const symbolsArray = JSON.parse(cached);
                    if (symbolsArray.length > 0) {
                        console.log('Loaded symbols from cache:', symbolsArray.slice(0, 5), '...');
                        setSymbols(symbolsArray);
                        setSelectedSymbol(symbolsArray[0]);
                        return;
                    }
                }

                console.log('Fetching from API:', apiSymbolsUrl);
                const resp = await axios.get(apiSymbolsUrl);
                console.log('API raw response:', resp.data);

                const symbolsArray = resp.data?.data?.map(item => item.symbol) || [];
                console.log('Extracted symbols:', symbolsArray.slice(0, 10));

                if (symbolsArray.length === 0) {
                    console.warn('No symbols found in API response.');
                    return;
                }

                setSymbols(symbolsArray);
                setSelectedSymbol(symbolsArray[0]);

                localStorage.setItem('symbols', JSON.stringify(symbolsArray));
                console.log('Symbols cached successfully.');
            } catch (err) {
                console.error('Error fetching symbols:', err);
            }
        };

        fetchSymbols();
    }, [apiSymbolsUrl]);

    const handleTrade = async (type) => {
        const payload = {
            userId,
            symbol: selectedSymbol,
            invest: parseFloat(investAmount) || 0,
            leverage,
            expiration,
            tradeType: type
        };

        setIsSubmitting(true);
        try {
            const res = await fetch("https://axioratrade.onrender.com/api/saveTrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                // console.log("Trade saved:", data.trade);
                toast.success('Trade executed successfully!', {
                    toastId: 'toast-st-success',
                    className: 'custom-toast',
                });
            } else {
                // Not enough profit or other error
                toast.error(data.message +
                    (data.availableDeposit !== undefined
                        ? ` (Available balance: ${data.availableDeposit})`
                        : ""), {
                    toastId: 'toast-st-fail2',
                    className: 'custom-toast',
                });
            }
        } catch (err) {
            // console.error("Trade submit failed:", err);
            toast.error('Failed to execute trade!', {
                toastId: 'toast-st-fail1',
                className: 'custom-toast',
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="mt-4">
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <h3 className="mb-0 fw-bolder">Assets</h3>
                    </div>

                    <div className="mb-3">
                        <select
                            className="form-select"
                            value={selectedSymbol}
                            onChange={(e) => setSelectedSymbol(e.target.value)}
                            disabled={isLoadingSymbols || symbols.length === 0}
                        >
                            {isLoadingSymbols && <option>Loading symbols...</option>}
                            {!isLoadingSymbols && symbols.length === 0 && <option>No symbols available</option>}
                            {!isLoadingSymbols &&
                                symbols.map((sym) => (
                                    <option key={sym} value={sym}>
                                        {sym}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <div className="input-group">
                            <span className="input-group-text">{currencySymbol}</span>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Invest Amount"
                                value={investAmount}
                                onChange={(e) => setInvestAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <select
                            className="form-select"
                            value={leverage}
                            onChange={(e) => setLeverage(e.target.value)}
                        >
                            <option value="">Leverage</option>
                            <option value="1x">1x</option>
                            <option value="2x">2x</option>
                            <option value="5x">5x</option>
                            <option value="10x">10x</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <select
                            className="form-select"
                            value={expiration}
                            onChange={(e) => setExpiration(e.target.value)}
                        >
                            <option value="">Expiration</option>
                            <option value="1m">1 min</option>
                            <option value="5m">5 min</option>
                            <option value="1h">1 hour</option>
                            <option value="1d">1 day</option>
                        </select>
                    </div>

                    <div className="d-flex justify-content-between gap-3 mt-3">
                        <button
                            className="btn btn-success flex-fill py-2"
                            style={{
                                // borderRadius: "8px",
                                fontWeight: 400,
                                fontSize: "1rem",
                                letterSpacing: "0.5px",
                                boxShadow: "0 4px 10px rgba(0, 128, 0, 0.2)",
                            }}
                            disabled={isSubmitting}
                            onClick={() => handleTrade("BUY")}
                        >
                            BUY
                        </button>

                        <button
                            className="btn btn-danger flex-fill py-2"
                            style={{
                                // borderRadius: "8px",
                                fontWeight: 400,
                                fontSize: "1rem",
                                letterSpacing: "0.5px",
                                boxShadow: "0 4px 10px rgba(255, 0, 0, 0.2)",
                            }}
                            disabled={isSubmitting}
                            onClick={() => handleTrade("SELL")}
                        >
                            SELL
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default TradablePanel;
