import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/register', formData);
            alert('Registration Successful! Please login.');
            navigate('/login');
        } catch (err) {
            alert('Registration failed. Username or email might already exist.');
        }
    };

    return (
        <div className="split-layout">
            <div className="split-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <h1>Kodbank</h1>
                <p>Secure, modern banking at your fingertips. Join thousands who trust us with their financial future.</p>
            </div>
            
            <div className="split-right">
                <div className="form-container">
                    <h2>Create Account</h2>
                    <p>Start your banking journey with us</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>👤 Username</label>
                            <input className="input-field" placeholder="demo" required onChange={e => setFormData({...formData, username: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>✉️ Email</label>
                            <input className="input-field" type="email" placeholder="demo@kodbank.com" required onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>📞 Phone</label>
                            <input className="input-field" placeholder="+1 (555) 000-0000" required onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="input-group">
                            <label>🔒 Password</label>
                            <input className="input-field" type="password" placeholder="Create a strong password" required onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                        
                        <button type="submit" className="btn-primary">Create Account</button>
                    </form>
                    
                    <div className="form-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </div>
                <div className="badge">💻 Developed by Syed Junaid Hussain</div>
            </div>
        </div>
    );
}