// import react.
import React from 'react';
// importing home component
import Deposit from './deposit';
// import react router.
import { Navigate, Route, useNavigate } from 'react-router-dom';

const PrivateDeposit = ({ component: Component, ...rest }) => {
    const isAuthenticated = localStorage.getItem('auth');

    return (

        isAuthenticated ? (
            <Deposit />
        ) : (
            <Navigate to="/login" />
        )
    );
};

export default PrivateDeposit;