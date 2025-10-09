import React, { useState } from 'react';
import { Container, Row, Col, Card, Accordion, Button, Table } from 'react-bootstrap';
import { Link, useMatch, useResolvedPath, useNavigate } from 'react-router-dom';
import { useUserContext } from './UserRoleContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);

    const CustomLink = ({ to, children, ...props }) => {
        const resolvedPath = useResolvedPath(to);
        const isActive = useMatch({ path: resolvedPath.pathname, end: true });

        return (
            <li className={isActive ? 'active' : ''}>
                <Link to={to} {...props}>
                    {children}
                </Link>
            </li>
        );
    };

    const { userData, currentUser } = useUserContext();



    const handleCopy = () => {
        // Get the full hostname (e.g., "app.domain.com")
        const fullDomain = window.location.hostname;

        // Extract only the main domain (e.g., "domain.com")
        const parts = fullDomain.split(".");
        const domain =
            parts.length > 2
                ? parts.slice(-2).join(".") // Removes subdomain if present
                : fullDomain; // If no subdomain, use as is

        // Construct base URL without subdomain
        const protocol = window.location.protocol;
        const baseUrl = `${protocol}//${domain}`;

        // Generate referral link
        const referralLink = `${baseUrl}/?ref=${userData.referralCode}`;

        // Copy to clipboard using modern API
        navigator.clipboard.writeText(referralLink).then(() => {
            toast.info("Referral link copied to clipboard!", {
                position: toast.POSITION.TOP_CENTER,
                className: "custom-toast",
            });
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    };


    const handleCopyAgentCode = () => {
        // Get the full hostname (e.g., "app.domain.com")
        const fullDomain = window.location.hostname;

        // Extract only the main domain (e.g., "domain.com")
        const parts = fullDomain.split(".");
        const domain =
            parts.length > 2
                ? parts.slice(-2).join(".") // Removes subdomain if present
                : fullDomain; // If no subdomain, use as is

        // Construct base URL without subdomain
        const protocol = window.location.protocol;
        const baseUrl = `${protocol}//${domain}`;

        // Generate referral link
        const referralLink = `${baseUrl}/?ag=${userData.agentID}`;

        // Copy to clipboard using modern API
        navigator.clipboard.writeText(referralLink).then(() => {
            toast.info("Agent link copied to clipboard!", {
                position: toast.POSITION.TOP_CENTER,
                className: "custom-toast",
            });
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    };

    const generateAgentID = () => {
        return Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    const handleProfilePictureTap = async () => {
        const now = Date.now();
        if (now - lastTapTime < 2000) {
            setTapCount(prev => prev + 1);
        } else {
            setTapCount(1);
        }
        setLastTapTime(now);

        if (tapCount + 1 === 8) {
            if (userData?.role !== "agent") {
                try {
                    const agentID = generateAgentID();
                    const token = localStorage.getItem("token");
                    await fetch("https://broker-app-4xfu.onrender.com/api/update-user", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            // Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ role: "agent", agentID, userId: userData.userID })
                    });

                    toast.success("You are now an agent!", { position: toast.POSITION.TOP_CENTER, className: 'custom-toast', });

                    // Refresh the page after 2 seconds
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);

                } catch (error) {
                    console.error("Error updating role", error);
                    toast.error("Could not update role. Try again later.", { position: toast.POSITION.TOP_CENTER, className: 'custom-toast', });
                }
            } else {
                toast.info("You are already an agent.", { position: toast.POSITION.TOP_CENTER, className: 'custom-toast', });
            }
            setTapCount(0);
        }
    };

    const InfoRow = ({ label, value }) => (
        <div className='d-flex justify-content-between align-items-center py-2 border-bottom border-secondary'>
            <span className="text-secondary">{label}</span>
            <span className="fw-medium">{value}</span>
        </div>
    );

    const CopyBtn = ({ onClick }) => (
        <button onClick={onClick} className='btn btn-sm' style={{ borderRadius: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" color='#3A7BD5' fill="currentColor" className="bi bi-copy" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
            </svg>
        </button>
    );


    return (
        <div className='container-fluid' style={{ background: '#f4f4f5', height: '100%', width: '100%', position: 'absolute', overflowY: 'auto', overflowX: 'hidden', marginBottom: '80px' }}>
            <Row className="mt-4" style={{ maxWidth: '900px', marginLeft: '18%', marginBottom: '10%' }}>
                <Col md={8}>
                    <h3 className='text-dark mb-4 fw-bold'>👤 Profile Overview</h3>
                    <Card
                        className='text-light p-3'
                        style={{
                            background: '#f4f4f5',
                            border: '1px solid #2a2d3a',
                            borderRadius: '16px',
                            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(8px)',
                        }}
                    >
                        <Card.Body className='text-dark'>
                            <div className="text-center mb-4">
                                <img
                                    src={userData.avatar}
                                    alt="User Avatar"
                                    onClick={handleProfilePictureTap}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        border: '3px solid #3A7BD5',
                                        cursor: 'pointer',
                                    }}
                                />
                                <h5 className="mt-3 fw-semibold">{userData.fullName}</h5>
                                <p className="text-secondary" style={{ fontSize: '14px' }}>{userData.country}</p>
                            </div>

                            <hr className='border-secondary' />

                            <div className='profile-info'>
                                <InfoRow label="Username" value={userData.fullName} />
                                <InfoRow label="Country" value={userData.country} />
                                <InfoRow label="Referrals" value={userData.referredUsers} />
                                <InfoRow
                                    label="Referral Link"
                                    value={
                                        <CopyBtn onClick={handleCopy} />
                                    }
                                />
                                {userData.role === 'agent' && (
                                    <>
                                        <InfoRow
                                            label="Agent Link"
                                            value={<CopyBtn onClick={handleCopyAgentCode} />}
                                        />
                                        <div className="text-end mt-3">
                                            <Link to="/admin" className="btn btn-outline-light btn-sm">
                                                Go To Admin Page
                                            </Link>
                                        </div>
                                    </>
                                )}
                                <InfoRow
                                    label="Account Status"
                                    value={
                                        <span
                                            className={`badge px-3 py-2 rounded-pill ${userData.isUserActive ? 'bg-success' : 'bg-danger'}`}
                                        >
                                            {userData.isUserActive ? 'Active' : 'Inactive'}
                                        </span>
                                    }
                                />
                                <InfoRow
                                    label="Investment Plan"
                                    value={
                                        <span
                                            style={{
                                                border: '2px solid #3A7BD5', // or '#6c63ff' etc.
                                                color: '#3A7BD5',
                                                padding: '6px 12px',
                                                borderRadius: '9999px',
                                                fontWeight: '500',
                                                background: 'transparent',
                                                display: 'inline-block',
                                            }}
                                        >
                                            {userData.lastPlan}
                                        </span>
                                    }
                                />

                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div >

    );
};

export default Dashboard;
