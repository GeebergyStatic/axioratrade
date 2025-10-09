import React, { useState, useEffect } from 'react';
import { useUserContext } from './UserRoleContext';
import { ToastContainer, toast } from "react-toastify";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import 'font-awesome/css/font-awesome.min.css'; // Import Font Awesome CSS
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);


const TradesTable = ({ userId }) => {
    const { userData } = useUserContext();
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrades = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `https://axioratrade.onrender.com/api/getUserTrades/${userId}`
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

    const calculateTradeStatus = (createdAt, expiration) => {
        const now = dayjs();
        const expirationDate = dayjs(createdAt).add(expiration, "millisecond"); // assuming expiration is in ms
        return now.isBefore(expirationDate) ? "Ongoing" : "Closed";
    };

    const tradeContainer = {
        maxWidth: '900px',
        marginLeft: '19%',
        background: '#f4f4f5',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    }
    return (
        <div className='container-fluid' style={{ background: '#f4f4f5', height: '100%', width: '100%', position: 'absolute', overflowY: 'hidden', overflowX: 'hidden', paddingBottom: '80px' }}>
            <div className="transaction-list p-4 rounded shadow-lg" style={tradeContainer}>
                <div className="overflow-auto">
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
                            {loading ? <p>Loading trades...</p> : error ? <p>Loading trades...</p> : <p>No trades found.</p>}
                            {trades.map((trade) => (
                                <tr key={trade._id}>
                                    <td>{trade.symbol}</td>
                                    <td>{trade.invest}</td>
                                    <td>{trade.leverage}</td>
                                    <td>{trade.expiration} ms</td>
                                    <td>{trade.tradeType}</td>
                                    <td>{calculateTradeStatus(trade.createdAt, trade.expiration)}</td>
                                    <td>{dayjs(trade.createdAt).format("YYYY-MM-DD HH:mm")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>);
};


export default TradesTable;
