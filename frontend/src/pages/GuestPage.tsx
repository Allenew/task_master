import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import './GuestPage.css';

const GuestPage = () => {
  return (
    <div className="guest-container">
      <nav className="guest-nav">
        <div className="logo">
          <img src="/src/assets/icon/task-master-text.png" alt="TaskMaster Logo" />
        </div>
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-outline">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      </nav>
      
      <main className="hero-section">
        <div className="hero-content">
          <h1>Manage your tasks with <span className="highlight">Efficiency</span></h1>
          <p>TaskMaster helps you organize your work and life. Track your progress, meet deadlines, and achieve your goals.</p>
          <Link to="/register" className="cta-button">Get Started for Free</Link>
          
          <div className="features">
            <div className="feature-item">
              <CheckCircle2 className="icon" />
              <span>Organize tasks</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 className="icon" />
              <span>Track progress</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 className="icon" />
              <span>Boost productivity</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="/src/assets/guest_page_placeholder.png"
            alt="Task Dashboard Preview"
            className="guest-illustration"
          />
        </div>
      </main>
    </div>
  );
};

export default GuestPage;
