import React, { useState, useEffect } from 'react';
import { useUserContext } from './UserRoleContext';
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import 'font-awesome/css/font-awesome.min.css';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const TradesTable = () => {
    const { userData } = useUserContext();
    const userId = userData?.userID;
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrades = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(
                    `https://axioratrade-aqy8.onrender.com/api/getTrade/${userId}`
                );

                if (response.data.success) {
                    setTrades(response.data.trades);
                } else {
                    setError("Failed to fetch trades.");
                }
            } catch (err) {
                console.error(err);
                setError("Server error while fetching trades.");
            } finally {
                setLoading(false);
            }
        };

        fetchTrades();
    }, [userId]);

    const calculateTradeStatus = (createdAt, expirationMs) => {
        const now = dayjs();
        const expirationDate = dayjs(createdAt).add(expirationMs, "millisecond");
        return now.isBefore(expirationDate) ? "Ongoing" : "Closed";
    };

    return (
        <div className='container-fluid' style={{ background: '#f4f4f5', height: '100%', width: '100%', position: 'absolute', overflowY: 'auto', overflowX: 'hidden', paddingBottom: '80px' }}>
            <div className="transaction-list p-4 rounded shadow-lg" style={{
                maxWidth: '900px',
                marginLeft: '19%',
                background: '#f4f4f5',
                boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
            }}><h2 className="text-center text-dark mb-4" style={{ borderBottom: '2px solid #3A7BD5', paddingBottom: '10px' }}>
                    Trade History
                </h2>
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>Symbol</th>
                                <th>Invest</th>
                                <th>Leverage</th>
                                <th>Expiration</th>
                                <th>Trade Type</th>
                                <th>Status</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Loading trades...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-danger">{error}</td>
                                </tr>
                            ) : trades.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center">No trades found.</td>
                                </tr>
                            ) : (
                                trades.map((trade) => {
                                    const status = calculateTradeStatus(trade.createdAt, trade.expiration);
                                    return (
                                        <tr key={trade._id}>
                                            <td>{trade.symbol}</td>
                                            <td>{trade.invest}</td>
                                            <td>{trade.leverage}</td>
                                            <td>{trade.expiration} ms</td>
                                            <td
                                                style={{
                                                    color: trade.tradeType.toLowerCase() === "buy" ? "green" : "red",
                                                    fontWeight: "bold"
                                                }}
                                            >
                                                {trade.tradeType}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${status === "Ongoing" ? "bg-warning text-dark" : "bg-secondary"
                                                        }`}
                                                >
                                                    {status}
                                                </span>
                                            </td>

                                            <td>{dayjs(trade.createdAt).format("DD/MM/YY")}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default TradesTable;
