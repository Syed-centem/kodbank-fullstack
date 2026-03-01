import { useState } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [balance, setBalance] = useState('---');
    const navigate = useNavigate();
    
    // Fetch the username we saved during login
    const username = localStorage.getItem('kodbank_user') || 'User';

    const checkBalance = async () => {
        try {
            const response = await axios.get('/getBalance');
            setBalance(response.data.balance);
            
            // Trigger the party popper!
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
            });
        } catch (err) {
            alert('Session expired. Please login again.');
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('kodbank_user');
        navigate('/login');
    };

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', width: '100%' }}>
            {/* Top Navigation Bar */}
            <nav className="dashboard-nav">
                <div className="nav-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    Kodbank
                </div>
                <button onClick={handleLogout} className="nav-logout">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                </button>
            </nav>

            {/* Main Dashboard Content */}
            <div className="dashboard-wrapper">
                <div className="main-card">
                    <p className="small-text">Welcome back!</p>
                    <h2>{username}</h2>
                    
                    <p className="balance-label">Available Balance</p>
                    <h1 className="balance-display">
                        ₹{balance !== '---' ? Number(balance).toLocaleString() : '---'}
                    </h1>
                    
                    <p className="balance-status">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Account in good standing
                    </p>
                    
                    <button className="btn-refresh" onClick={checkBalance}>
                        Refresh Balance
                    </button>
                </div>

                {/* Side Status Cards */}
                <div className="side-cards">
                    <div className="stat-card">
                        <p>Account Status</p>
                        <h3 className="text-green">Active</h3>
                    </div>
                    <div className="stat-card">
                        <p>Account Type</p>
                        <h3>Customer</h3>
                    </div>
                </div>
            </div>
            
            {/* Your Custom Developer Badge */}
            <div className="badge" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}>
                💻 Developed by Syed Junaid Hussain
            </div>
        </div>
    );
}