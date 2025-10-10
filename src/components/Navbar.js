import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useMatch, useLocation, useResolvedPath, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompass, faWallet, faChartLine, faUser, faSignOutAlt, faReceipt, faClockRotateLeft, faCircleArrowDown } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import Context from '../Context';
import { useUserContext } from './UserRoleContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Navbar() {
  const [showNav, setShowNav] = useState(false);
  const { user, setUser } = useContext(Context);
  const { userData, currentUser } = useUserContext();
  const location = useLocation();
  const history = useNavigate();



  const logout = () => {
    const isLogout = window.confirm('Do you want to log out ?');
    if (isLogout) {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          console.log('User signed out');
          // You can also redirect the user or perform other actions upon sign-out.
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        });
      // remove local storage.
      localStorage.removeItem('auth');
      // redirect to login page.
      history('/login');
    }
  }
  const initializeTooltip = (element) => {
    if (element) {
      const tooltip = new window.bootstrap.Tooltip(element, {
        placement: 'top', // Adjust placement as needed
        title: element.title,
      });
    }
  };


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



  return (
    <>
      {/* <ToastContainer /> */}
      {showNav && (
        <div className="backdrop"></div>
      )}
      <nav
        className={`navbar ${userData.role === "checker" ? "site-nav-checker" : "site-nav"
          } ${location.pathname === "/login" ||
            location.pathname === "/signup" ||
            location.pathname === "/admin" ||
            location.pathname === "/forgot-password"
            ? "d-none"
            : ""
          } navbar-dark bg-light p-2`}
      >
        <ul className="nav flex-column flex-lg-row align-items-center w-100">
          {/* Branding */}
          <div className="d-flex align-items-center d-none d-lg-flex">
            <img
              src="../axiora-logo.png"
              alt="AxioraTrade Logo"
              style={{ width: "40px", height: "40px", objectFit: "contain", marginRight: "10px" }}
            />
            <h5 className="text-dark text-start mb-0">
              Axiora<span style={{ color: "#3A7BD5" }}>Trade</span>
            </h5>
          </div>


          <hr className="my-2 d-block d-lg-none" />

          {/* Dashboard */}
          <CustomLink
            className={`nav-link ${location.pathname === "/"
              ? "active bg-primary text-white px-3"
              : "text-secondary"
              }`}
            to="/"
          >
            <FontAwesomeIcon icon={faCompass} />
            <span>Dashboard</span>
          </CustomLink>

          {/* Fund Section */}
          <h6 className="text-dark fw-bold text-start my-2 my-lg-0 collapse-header">
            Fund
          </h6>
          <hr className="my-2 collapse-hr" />

          <CustomLink
            className={`nav-link ${location.pathname === "/deposit"
              ? "active bg-primary text-white px-3"
              : "text-secondary"
              }`}
            to="/deposit"
          >
            <FontAwesomeIcon icon={faCircleArrowDown} />
            <span>Deposit</span>
          </CustomLink>


          <CustomLink
            className={`nav-link ${location.pathname === "/withdraw"
              ? "active bg-primary text-white px-3"
              : "text-secondary"
              }`}
            to="/withdraw"
          >
            <FontAwesomeIcon icon={faWallet} />
            <span>Withdraw</span>
          </CustomLink>

          <CustomLink
            className={`nav-link ${location.pathname === "/transactions"
              ? "active bg-primary text-white px-3"
              : "text-secondary"
              }`}
            to="/transactions"
          >
            <FontAwesomeIcon icon={faReceipt} />
            <span>Transactions</span>
          </CustomLink>

          {/* Others Section */}
          <h6 className="text-dark fw-bold text-start my-2 my-lg-0 collapse-header">
            Others
          </h6>
          <hr className="my-2 collapse-hr" />
          <CustomLink
            className={`nav-link ${location.pathname === "/investment_plans"
              ? "active bg-primary text-white px-3"
              : "text-secondary"
              }`}
            to="/investment_plans"
          >
            <FontAwesomeIcon icon={faChartLine} />
            <span>Investment Plans</span>
          </CustomLink>

          <CustomLink
            className={`nav-link ${location.pathname === "/trade-history"
              ? "active bg-primary text-white px-3"
              : "text-secondary"
              }`}
            to="/trade-history"
          >
            <FontAwesomeIcon icon={faClockRotateLeft} />
            <span>Trade History</span>
          </CustomLink>

          <CustomLink
            className={`nav-link ${location.pathname === "/profile"
              ? "active bg-primary text-white px-3"
              : "text-secondary"
              }`}
            to="/profile"
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Profile</span>
          </CustomLink>

          <button className="nav-link text-secondary" onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="mx-2">Logout</span>
          </button>
        </ul>
      </nav>

    </>
  );
}

export default Navbar;
