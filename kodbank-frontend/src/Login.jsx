import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/login', credentials);
            // Save username to show on dashboard
            localStorage.setItem('kodbank_user', res.data.username); 
            navigate('/dashboard');
        } catch (err) {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="split-layout">
            <div className="split-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <h1>Kodbank</h1>
                <p>Welcome back. Access your dashboard to manage your finances securely.</p>
            </div>
            
            <div className="split-right">
                <div className="form-container">
                    <h2>Sign In</h2>
                    <p>Enter your details to access your account</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>👤 Username</label>
                            <input className="input-field" placeholder="demo" required onChange={e => setCredentials({...credentials, username: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>🔒 Password</label>
                            <input className="input-field" type="password" placeholder="••••••••" required onChange={e => setCredentials({...credentials, password: e.target.value})} />
                        </div>
                        
                        <button type="submit" className="btn-primary">Sign In</button>
                    </form>
                    
                    <div className="form-footer">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </div>
                </div>
                <div className="badge">💻 Developed by Syed Junaid Hussain</div>
            </div>
        </div>
    );
}