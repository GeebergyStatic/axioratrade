// import react.
import React from 'react';
// importing home component
import TradesTable from './tradeHistory';
// import react router.
import { Navigate, Route, useNavigate } from 'react-router-dom';

const PrivateTradeHistory = ({ component: Component, ...rest }) => {
    const isAuthenticated = localStorage.getItem('auth');

    return (

        isAuthenticated ? (
            <TradesTable />
        ) : (
            <Navigate to="/login" />
        )
    );
};

export default PrivateTradeHistory;