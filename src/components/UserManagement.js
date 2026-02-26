import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EditUserModal from './EditUserModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { useUserContext } from './UserRoleContext';
import getSymbolFromCurrency from 'currency-symbol-map';
import WalletManager from './UpdateWallets';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const { userData } = useUserContext();
  const [searchTerm, setSearchTerm] = useState(''); // ✅ New state
  const agentID = userData.agentID;
  const isOwner = userData.isOwner;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers(agentID);
  }, []);

  const fetchUsers = async (agentID) => {
    setIsLoading(true);
    try {
      // Include the agentID as a query parameter in the API request
      const response = await axios.get(`https://axioratrade-8pb9.onrender.com/api/users?agentID=${agentID}`);
      setUsers(response.data); // Assuming response.data is an array of users
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchUsers = async () => {
  //   setIsLoading(true);
  //   try {
  //     // Include the agentID as a query parameter in the API request
  //     const response = await axios.get(`https://axioratrade-8pb9.onrender.com/api/users`);
  //     setUsers(response.data); // Assuming response.data is an array of users
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleEditClick = (user) => {
    setSelectedUser(user); // Set the selected user for editing
  };

  const filteredUsers = users.filter(user =>
    user.userId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || // ✅ fixed case sensitivity
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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


  const containerStyle = {
    position: 'absolute',
    minHeight: '100vh', // Ensures the background color covers the whole screen vertically
    width: '100%', // Ensures the background color covers the whole width
    background: '#13151b',
    overflowX: 'scroll',
    color: '#fff',
    padding: '30px',
    // borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    // marginTop: '20px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    marginBottom: '70px',
  };

  const thStyle = {
    backgroundColor: '#444',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  };

  const tdStyle = {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #ccc',
  };

  const buttonStyle = {
    backgroundColor: '#1f78d1',
    color: '#fff',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const buttonHoverStyle = {
    backgroundColor: '#165ea0',
  };

  return (
    <div style={containerStyle}>
      <Link to='/'><i class="fa fa-arrow-left"></i> Back to home</Link>
      {isOwner && <WalletManager />}
      <h1 className='mt-5'>User Management</h1>
      <span className='text-warning mb-1'><FontAwesomeIcon className='mx-2' icon={faInfoCircle} />You can edit and load your clients' accounts from here!</span>
      {/* ✅ Search Bar */}
      <input
        type="text"
        placeholder="Search by ID, name, or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: '10px',
          width: '100%',
          marginTop: '20px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          boxSizing: 'border-box'
        }}
      />
      {isLoading ? (
        <div className="text-center">
          <i className="fa fa-spinner fa-spin fa-3x fa-fw text-light"></i>
          <p className="text-light">Loading users...</p>
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Number</th>
              <th style={thStyle}>Deposit</th>
              <th style={thStyle}>Profit</th>
              <th style={thStyle}>Total Withdrawn</th>
              <th style={thStyle}>Referred Users</th>
              <th style={thStyle}>Referred By (ID)</th>
              <th style={thStyle}>Account Active?</th>
              <th style={thStyle}>Currency</th>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>Investment Plan</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => ( // ✅ Use filtered users
              <tr key={user.id}>
                <td style={tdStyle}>{user.userId}</td>
                <td style={tdStyle}>{user.name}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.number}</td>
                <td style={tdStyle}>{formatCurrency(user.deposit, user.currencySymbol)}</td>
                <td style={tdStyle}>{formatCurrency(user.profit, user.currencySymbol)}</td>
                <td style={tdStyle}>{formatCurrency(user.totalWithdrawn, user.currencySymbol)}</td>
                <td style={tdStyle}>{user.referredUsers}</td>
                <td style={tdStyle}>{user.referredBy}</td>
                <td style={tdStyle}>{user.isUserActive ? 'true' : 'false'}</td>
                <td style={tdStyle}>{user.currencySymbol}</td>
                <td style={tdStyle}>{user.country}</td>
                <td style={tdStyle}>{user.lastPlan}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleEditClick(user)}
                    style={buttonStyle}
                    onMouseOver={(e) => (e.target.style.backgroundColor = buttonHoverStyle.backgroundColor)}
                    onMouseOut={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && (
        <EditUserModal user={selectedUser} onClose={() => setSelectedUser(null)} onUserUpdated={fetchUsers} />
      )}
    </div>
  );
};

export default UserManagement;
