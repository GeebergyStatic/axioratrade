import React, { useState, useEffect } from 'react';
import { Spinner } from "react-bootstrap";
import axios from 'axios';


const EditUserModal = ({ user, onClose, onUserUpdated }) => {
  const [editedUser, setEditedUser] = useState(user);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEditedUser(user); // Reset the edited user if 'user' prop changes
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await axios.put(`https://axioratrade-8pb9.onrender.com/api/users/${editedUser._id}`, editedUser);

      onUserUpdated(); // Refresh the user list after saving
      onClose(); // Close the modal after saving
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating user:', error);
      setIsLoading(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Edit User</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Name:</label>
            <input
              type="text"
              name="name"
              value={editedUser.name}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Email:</label>
            <input
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Deposit:</label>
            <input
              type="number"
              name="deposit"
              value={editedUser.deposit}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Profit:</label>
            <input
              type="number"
              name="profit"
              value={editedUser.profit}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Total Withdrawn:</label>
            <input
              type="number"
              name="totalWithdrawn"
              value={editedUser.totalWithdrawn}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Account Verified?</label>
            <select
              name="isUserActive"
              value={editedUser.isUserActive}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Currency:</label>
            <input
              type="text"
              name="currencySymbol"
              value={editedUser.currencySymbol}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Country:</label>
            <input
              type="text"
              name="country"
              value={editedUser.country}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={inputContainerStyle}>
            <label style={labelStyle}>Investment Plan:</label>
            <input
              type="text"
              name="lastPlan"
              value={editedUser.lastPlan}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          {isLoading ? (
            <Spinner animation="border" size="sm" variant="primary" />
          ) : (
            <div style={buttonContainerStyle}>
              <button onClick={handleSave} style={saveButtonStyle}>Save</button>
              <button onClick={onClose} style={cancelButtonStyle}>Cancel</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Modal overlay style (dimmed background)
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000, // Ensure it's on top of other content
};

// Modal content box style
const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '400px', // Increased width for better form layout
  textAlign: 'center',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  maxHeight: '80vh', // Limit the height of the modal
  overflowY: 'auto', // Enable scroll if content exceeds height
};

// Input container for consistent spacing
const inputContainerStyle = {
  marginBottom: '15px', // Space between form fields
  textAlign: 'left',
};

// Label style
const labelStyle = {
  fontWeight: 'bold',
  marginBottom: '5px',
  display: 'block',
  color: '#000',
};

// Input field style
const inputStyle = {
  width: '100%',
  padding: '8px',
  marginBottom: '5px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '14px',
};

// Button container style
const buttonContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
};

// Save button style
const saveButtonStyle = {
  backgroundColor: '#4CAF50',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  width: '48%',
};

const cancelButtonStyle = {
  backgroundColor: '#f44336',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  width: '48%',
};

export default EditUserModal;
