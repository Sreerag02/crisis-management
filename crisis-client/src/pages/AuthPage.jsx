import React, { useState } from 'react';
import { api } from '../services/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user'); // 'user' or 'volunteer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    aadhaar: '',
    mobile: '',
    skill: '',
    district: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login flow
        const credentials = {
          email: form.email,
          password: form.password
        };

        const response = await api.auth.login(credentials);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        window.location.reload();
      } else {
        // Registration flow
        const registerData = {
          name: form.name,
          email: form.email,
          password: form.password,
          aadhaar: form.aadhaar,
          mobile: form.mobile,
          role: userType === 'volunteer' ? 'volunteer' : 'user'
        };

        if (userType === 'volunteer') {
          // Register as volunteer
          registerData.role = 'volunteer';
          registerData.skill = form.skill;
          registerData.district = form.district;
        }

        const response = await api.auth.register(registerData);
        
        setIsLogin(true);
        setError('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">{isLogin ? 'Sign In to CrisisNet' : 'Sign Up for CrisisNet'}</h2>
          <p className="auth-subtitle">
            {isLogin ? "Access the dashboard and emergency services" : "Join to get help or contribute to crisis management"}
          </p>
        </div>

        <form className="auth-body" onSubmit={handleSubmit}>
          {error && <div className="alert-banner danger">{error}</div>}

          {!isLogin && (
            <div className="tab-bar mb-16">
              <div className={`tab ${userType === 'user' ? 'active' : ''}`} onClick={() => setUserType('user')}>
                Citizen
              </div>
              <div className={`tab ${userType === 'volunteer' ? 'active' : ''}`} onClick={() => setUserType('volunteer')}>
                Volunteer
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                required
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              required
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Aadhaar Number</label>
                  <input
                    className="form-control"
                    required
                    value={form.aadhaar}
                    onChange={e => setForm({...form, aadhaar: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    required
                    value={form.mobile}
                    onChange={e => setForm({...form, mobile: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          {!isLogin && userType === 'volunteer' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Skill/Expertise</label>
                  <input
                    className="form-control"
                    required
                    value={form.skill}
                    onChange={e => setForm({...form, skill: e.target.value})}
                    placeholder="e.g. Medical, Rescue, Logistics"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">District</label>
                  <select
                    className="form-control"
                    required
                    value={form.district}
                    onChange={e => setForm({...form, district: e.target.value})}
                  >
                    <option value="">Select District</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                    <option value="Ernakulam">Ernakulam</option>
                    <option value="Thrissur">Thrissur</option>
                    <option value="Kozhikode">Kozhikode</option>
                    <option value="Kannur">Kannur</option>
                    <option value="Palakkad">Palakkad</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button className="btn btn-primary" style={{width: '100%', marginTop: '10px'}} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>

          {isLogin && (
            <div style={{textAlign: 'center', marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setUserType('user')}
                style={{
                  background: userType === 'user' ? 'var(--primary)' : 'none',
                  border: '1px solid var(--primary)',
                  color: userType === 'user' ? 'white' : 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '4px'
                }}
              >
                Citizen Login
              </button>
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setUserType('volunteer')}
                style={{
                  background: userType === 'volunteer' ? 'var(--primary)' : 'none',
                  border: '1px solid var(--primary)',
                  color: userType === 'volunteer' ? 'white' : 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '4px'
                }}
              >
                Volunteer Login
              </button>
            </div>
          )}
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>Don't have an account? <span className="auth-link" onClick={() => setIsLogin(false)}>Sign Up here</span></p>
          ) : (
            <p>Already have an account? <span className="auth-link" onClick={() => setIsLogin(true)}>Sign In here</span></p>
          )}
        </div>
      </div>

      <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px;
        }
        .auth-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 450px;
          overflow: hidden;
        }
        .auth-header {
          padding: 30px 30px 10px;
          text-align: center;
        }
        .auth-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--navy);
          margin-bottom: 8px;
        }
        .auth-subtitle {
          color: var(--text-light);
          font-size: 14px;
        }
        .auth-body {
          padding: 20px 30px;
        }
        .auth-footer {
          padding: 20px 30px;
          text-align: center;
          background: #fafafa;
          border-top: 1px solid #eee;
          font-size: 14px;
        }
        .auth-link {
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
