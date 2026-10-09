import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'At least 1 uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'At least 1 lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'At least 1 number', test: (p) => /[0-9]/.test(p) },
  { label: 'At least 1 special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function WorkerRegister() {
  const { registerWorker, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedWorkerId, setGeneratedWorkerId] = useState('');

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, underscores, and hyphens';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return '';
      case 'mobile':
        if (!value.trim()) return 'Mobile number is required';
        if (value.replace(/\D/g, '').length < 10) return 'Mobile number must be at least 10 digits';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error on change
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
    
    if (name === 'password') {
      // Re-validate confirmPassword when password changes
      if (touched.confirmPassword) {
        setErrors(prev => ({ 
          ...prev, 
          confirmPassword: validateField('confirmPassword', formData.confirmPassword) 
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    setGeneratedWorkerId('');
    
    // Mark all fields as touched
    const allTouched = {
      username: true,
      email: true,
      mobile: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await registerWorker(
        formData.username.trim(),
        formData.email.trim(),
        formData.mobile.trim(),
        formData.password,
        formData.confirmPassword
      );
      
      if (result.success) {
        setSuccessMessage('Worker account created successfully!');
        setGeneratedWorkerId(result.workerId);
      } else {
        setServerError(result.error);
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    PASSWORD_REQUIREMENTS.forEach(req => {
      if (req.test(password)) strength++;
    });
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900">Municipal Road Repair</h1>
          <p className="text-surface-500 mt-1">Worker Registration</p>
        </div>

        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900">Create Worker Account</h2>
            <p className="text-surface-500 text-sm mt-1">Register to access your worker dashboard</p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm" role="alert">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && generatedWorkerId && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col gap-2 text-green-700 text-sm" role="alert">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
              <div className="ml-8 p-3 bg-green-100 rounded-lg">
                <p className="font-mono text-lg font-semibold">Your Worker ID: <span className="text-primary-700">{generatedWorkerId}</span></p>
                <p className="text-xs text-green-600 mt-1">Save this Worker ID. You will need it to log in.</p>
              </div>
              <Link 
                to="/worker/login" 
                className="inline-flex items-center justify-center w-full mt-3 btn-primary"
              >
                Go to Login
              </Link>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label htmlFor="username" className="label">Username <span className="text-red-500">*</span></label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input ${errors.username && touched.username ? 'input-error' : ''}`}
                  placeholder="raj_sharma"
                  required
                  autoComplete="username"
                  disabled={isLoading || authLoading}
                />
                {errors.username && touched.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
                <p className="mt-1 text-xs text-surface-500">Letters, numbers, underscores, and hyphens only (e.g., raj_sharma)</p>
              </div>

              <div>
                <label htmlFor="email" className="label">Email <span className="text-red-500">*</span></label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input ${errors.email && touched.email ? 'input-error' : ''}`}
                  placeholder="raj.sharma@municipal.gov"
                  required
                  autoComplete="email"
                  disabled={isLoading || authLoading}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="mobile" className="label">Mobile Number <span className="text-red-500">*</span></label>
                <input
                  id="mobile"
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input ${errors.mobile && touched.mobile ? 'input-error' : ''}`}
                  placeholder="+91 98765 43210"
                  required
                  autoComplete="tel"
                  disabled={isLoading || authLoading}
                />
                {errors.mobile && touched.mobile && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                )}
                <p className="mt-1 text-xs text-surface-500">Include country code (e.g., +91 for India)</p>
              </div>

            <div>
              <label htmlFor="password" className="label">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input pr-12 ${errors.password && touched.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  disabled={isLoading || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading || authLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              
              {/* Password Requirements */}
              <div className="mt-3 p-3 bg-surface-50 rounded-lg">
                <p className="text-xs font-medium text-surface-700 mb-2">Password must contain:</p>
                <ul className="space-y-1">
                  {PASSWORD_REQUIREMENTS.map((req, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs">
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        req.test(formData.password) ? 'text-green-600 border-green-600' : 'text-surface-300 border-surface-300'
                      }`}>
                        {req.test(formData.password) && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className={`${req.test(formData.password) ? 'text-green-700' : 'text-surface-500'}`}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {/* Strength meter */}
                <div className="mt-3">
                  <div className="flex gap-1 mb-1">
                    {PASSWORD_REQUIREMENTS.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 flex-1 rounded ${
                          index < passwordStrength ? strengthColors[index] : 'bg-surface-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-surface-500">
                    Strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password <span className="text-red-500">*</span></label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}`}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={isLoading || authLoading}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading || authLoading}
            >
              {isLoading || authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Already have an account?{' '}
              <Link to="/worker/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-surface-400 mt-6">
          Municipal Road Repair System &copy; 2024
        </p>
      </div>
    </div>
  );
}