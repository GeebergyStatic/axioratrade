import { useContext, useRef, useEffect, useState, useCallback, Component } from 'react';
import { Link, useMatch, useResolvedPath, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faChartLine, faMoneyBillWave, faUser, faWallet, faExchangeAlt, faHandHoldingUsd, faHourglassHalf, faCoins, faMoneyBillTrendUp } from '@fortawesome/free-solid-svg-icons';
import Loading from './Loading';
import TradingViewWidget from './TradingViewWidget';
import TradingViewWidgetTwo from './TradingViewWidgetTwo';
import { auth, realTimeDb } from '../firebase';
import { useUserContext } from './UserRoleContext';
import { ToastContainer, toast } from "react-toastify";
import FeeItem from './FeeItem';
import BtcTaskList from './btcTaskDeposit';
import { Spinner } from "react-bootstrap"; // Import Bootstrap spinner
import BtcFundingList from "./btcTaskFund";
import BtcWithdrawList from './btcWithdraw';
import TradablePanel from './TradablePanel';
import TradingViewTicker from './TradingViewTicker';
import getSymbolFromCurrency from 'currency-symbol-map';


function Home() {
  const user = auth.currentUser;
  const { userData, currentUser } = useUserContext();
  const currencySymbol = userData.currencySymbol;
  const [isCheckLoading, setIsCheckLoading] = useState(false);

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

  const options = [
    { to: "/investment_plans", icon: faArrowDown, label: "Add Deposit" },
    { to: "/investment_plans", icon: faChartLine, label: "Invest" },
    { to: "/withdraw", icon: faMoneyBillWave, label: "Withdraw" },
    { to: "/profile", icon: faUser, label: "Profile" }
  ];


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


  const initializeTooltip = (element) => {
    if (element) {
      const tooltip = new window.bootstrap.Tooltip(element, {
        placement: 'top', // Adjust placement as needed
        title: element.title,
      });
    }
  };


  const tooltipRefTrophy = useRef();
  const tooltipTitleTrophy = `Events`;


  useEffect(() => {
    initializeTooltip(tooltipRefTrophy.current);
  }, []);

  useEffect(() => {
    // Remove the 'new' key from localStorage
    localStorage.removeItem('new');
  }, []);

  const spinner = (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100px" }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );

  const boxStyle = {
    width: '85%',
    marginLeft: '16.5%',
    marginRight: '3.5%',
    // height: '460px',
    backgroundColor: '#f4f4f5', // White background color
    color: '#ffff', // Text color
    textAlign: 'center',
    padding: '5px',
    // boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    // overflowY: 'auto'
  };


  const sizeAdjust = {
    width: '85%',
    marginLeft: '16.5%',
    marginRight: '3.5%',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    // overflowY: 'auto'
  }

  const userStyle = {
    fontSize: '18px',
  };

  const accBox = {
    height: '110px',
    width: '100%',
    border: 'none',
    marginTop: '5px',
    color: '#fff',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
  }

  const smaller = {
    fontSize: '24px',
    fontWeight: 'bolder',
  }

  const avatar = {
    height: '2rem',
    width: '2rem',
    borderRadius: '50%',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '2px solid #1F222D',
    cursor: 'pointer',
  }
  const taskBoxStyle = {
    width: '85%',
    marginLeft: '16.5%',
    marginRight: '3.5%',
  };
  const tradingChart = {
    height: '330px',
    backgroundColor: '#1F222D', // White background color
    color: '#000', // Text color
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    overflowY: 'auto',
    borderTop: '2px solid #dee2e6',
  };

  const moreOptions = {
    width: '85%',
    marginLeft: '16.5%',
    marginRight: '3.5%',
    marginBottom: '10%',
    height: '190px',
    backgroundColor: '#f4f4f5',
    color: '#1F222D',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    borderTop: '2px solid #dee2e6',
  }

  const pointer = {
    cursor: 'pointer'
  }

  // ToggleTabs component
  function ToggleTabs() {
    const [activeTab, setActiveTab] = useState('deposits');

    return (
      <>
        <div className="d-flex justify-content-center mb-3">
          <button
            className={`btn ${activeTab === 'deposits' ? 'btn-primary' : 'btn-outline-primary'} mx-2`}
            onClick={() => setActiveTab('deposits')}
          >
            Deposits
          </button>
          <button
            className={`btn ${activeTab === 'withdrawals' ? 'btn-primary' : 'btn-outline-primary'} mx-2`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdrawals
          </button>
        </div>

        <div>
          {activeTab === 'deposits' && <BtcTaskList />}
          {activeTab === 'withdrawals' && <BtcWithdrawList />}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="home-container main-container">
        <TradingViewTicker />
        <div className="container">
          {userData.role !== 'agent' ? (
            <>
              <div style={{ ...boxStyle, overflow: 'hidden' }}>
                <div
                  className="d-flex align-items-center justify-content-end p-2 rounded-3"
                  style={{
                    // maxWidth: "260px",
                    marginLeft: "auto",
                  }}
                >
                  <img
                    src={userData.avatar}
                    alt="User Avatar"
                    className="rounded-circle me-2"
                    style={{
                      width: "32px",
                      height: "32px",
                      objectFit: "cover",
                      border: "2px solid #bfbfc1",
                    }}
                  />
                  <div className="d-flex flex-column text-end">
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#222",
                        fontSize: "1rem",
                      }}
                    >
                      {userData.fullName}
                    </span>
                    <small style={{ color: "#555", fontSize: "0.85rem" }}>
                      {userData.role !== "client" ? userData.role : "Trader"}
                    </small>
                  </div>
                </div>


                {/* first row */}
                <div className="row">
                  <div className="col-md-4">
                    <div className="card bg-info" style={accBox}>
                      <div className="card-body">
                        <h5 className="d-flex align-items-start" style={userStyle}>
                          <FontAwesomeIcon icon={faWallet} size="sm" />
                          <span className="mx-1">Total deposit</span>
                        </h5>
                        <p className="card-text text-start" style={smaller}>
                          {userData.deposit != null ? formatCurrency(userData.deposit, currencySymbol) : "---"}
                        </p>

                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card bg-success" style={accBox}>
                      <div className="card-body">
                        <h5 className="d-flex align-items-start" style={userStyle}>
                          <FontAwesomeIcon icon={faExchangeAlt} size="sm" />
                          <span className="mx-1">Profit</span>
                        </h5>
                        <p className="card-text text-start" style={smaller}>
                          {userData.profit != null ? formatCurrency(userData.profit, currencySymbol) : "---"}
                        </p>
                      </div>
                    </div>
                  </div>


                  <div className="col-md-4">
                    <div className="card bg-danger" style={accBox}>
                      <div className="card-body">
                        <h5 className="d-flex align-items-start" style={userStyle}>
                          <FontAwesomeIcon icon={faHourglassHalf} size="sm" />
                          <span className="mx-1">Total Withdrawal</span>
                        </h5>
                        <p className="card-text text-start" style={smaller}>
                          {userData.totalWithdrawn != null ? formatCurrency(userData.totalWithdrawn, currencySymbol) : "---"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className='row align-items-center' style={taskBoxStyle}>
                <div className='col-md-8'>
                  <div className='mt-5' style={tradingChart}>
                    <TradingViewWidget />
                  </div>
                </div>
                {/* second column home page */}
                <div className='col-md-4'>
                  <TradablePanel
                    apiSymbolsUrl="https://api.twelvedata.com/forex_pairs?apikey=9553319778a84e6baa4e6c42093db74f"
                  />
                </div>
              </div>
              {/* end of task box */}
              <div style={{ ...boxStyle, overflowY: 'auto', borderTop: '2px solid #dee2e6', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)' }} className='mt-3'>
                <TradingViewWidgetTwo />
              </div>
              {/*  */}
              <div className="moreOptions mt-5 p-4 text-center" style={{ ...moreOptions, overflowY: "auto" }}>
                <h5 className="mb-4">More Options</h5>
                <div className="row row-cols-2 row-cols-md-4 g-4 justify-content-center">
                  {options.map((option, index) => (
                    <div key={index} className="col d-flex flex-column align-items-center">
                      <Link
                        to={option.to}
                        className="rounded-circle bg-secondary p-3 d-flex align-items-center justify-content-center shadow"
                        style={{ width: "50px", height: "50px", color: "white", textDecoration: "none", transition: "0.3s" }}
                      >
                        <FontAwesomeIcon icon={option.icon} size="lg" />
                      </Link>
                      <p className="fw-bold mt-2">{option.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* ===== AGENT SECTION ===== */}
              <div className="mt-4 main-container" style={sizeAdjust}>
                <ToggleTabs />
                {/* You can add <BtcTaskList /> and <BtcWithdraw /> here if needed */}
              </div>
            </>
          )}
        </div>
      </div>
    </>

  );
}

export default Home;