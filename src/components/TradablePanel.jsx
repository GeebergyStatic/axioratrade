// TradablePanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { useUserContext } from './UserRoleContext';
import getSymbolFromCurrency from 'currency-symbol-map';


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
                const cached = localStorage.getItem('symbols');
                if (cached) {
                    const symbolsArray = JSON.parse(cached);
                    if (symbolsArray.length > 0) {
                        setSymbols(symbolsArray);
                        setSelectedSymbol(symbolsArray[0]);
                        return;
                    }
                }
                const resp = await axios.get(apiSymbolsUrl);

                const symbolsArray = resp.data?.data?.map(item => item.symbol) || [];

                if (symbolsArray.length === 0) {
                    console.warn('No symbols found in API response.');
                    return;
                }

                setSymbols(symbolsArray);
                setSelectedSymbol(symbolsArray[0]);

                localStorage.setItem('symbols', JSON.stringify(symbolsArray));
            } catch (err) {
                console.error('Error fetching symbols:', err);
            }
        };

        fetchSymbols();
    }, [apiSymbolsUrl]);


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

    const handleTrade = async (type) => {
        // ✅ Validation checks
        if (!selectedSymbol) {
            toast.error("Please select an asset before trading.", {
                toastId: "toast-symbol",
                className: "custom-toast",
            });
            return;
        }

        if (!investAmount || isNaN(investAmount)) {
            toast.error("Please enter a valid investment amount.", {
                toastId: "toast-invest",
                className: "custom-toast",
            });
            return;
        }

        if (parseFloat(investAmount) < 50) {
            toast.error(`Minimum investment is ${formatCurrency(50, currencySymbol)}.`, {
                toastId: "toast-min",
                className: "custom-toast",
            });
            return;
        }

        if (!leverage || leverage <= 0) {
            toast.error("Please select a valid leverage value.", {
                toastId: "toast-lev",
                className: "custom-toast",
            });
            return;
        }

        if (!expiration || expiration <= 0) {
            toast.error("Please choose a valid expiration time.", {
                toastId: "toast-exp",
                className: "custom-toast",
            });
            return;
        }

        const payload = {
            userId,
            symbol: selectedSymbol,
            invest: parseFloat(investAmount),
            leverage,
            expiration,
            tradeType: type,
        };

        setIsSubmitting(true);

        try {
            const res = await fetch("https://axioratrade-8pb9.onrender.com/api/saveTrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Trade executed successfully!", {
                    toastId: "toast-st-success",
                    className: "custom-toast",
                });
            } else {
                toast.error(
                    data.message +
                    (data.availableDeposit !== undefined
                        ? ` (Available balance: ${data.availableDeposit})`
                        : ""),
                    {
                        toastId: "toast-st-fail2",
                        className: "custom-toast",
                    }
                );
            }
        } catch (err) {
            toast.error("Failed to execute trade!", {
                toastId: "toast-st-fail1",
                className: "custom-toast",
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
