import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/token', formData);
      login(response.data.access_token);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login');
      toast.error(err.response?.data?.detail || 'Failed to login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <Link to="/">
          <img src="/src/assets/icon/task-master-text.png" alt="TaskMaster Logo" className="auth-logo" />
        </Link>
      </div>
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Enter your email and password to sign in</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="mail@simmmple.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Min. 8 characters"
            />
          </div>
          <button type="submit" className="auth-btn">Sign In</button>
        </form>
        
        <div className="auth-footer">
          Not registered yet? <Link to="/register">Create an Account</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
