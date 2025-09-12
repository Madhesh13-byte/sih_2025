import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

const EnhancedForm = ({ children, onSubmit, className = '' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Add particle effect
    createParticles(e.target);
    
    try {
      await onSubmit(e);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createParticles = (element) => {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${rect.left + Math.random() * rect.width}px`;
      particle.style.top = `${rect.top + Math.random() * rect.height}px`;
      document.body.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 2000);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`enhanced-form ${className} ${isSubmitting ? 'loading' : ''}`}
    >
      {children}
      
      {showSuccess && (
        <div className="success-celebration">
          <CheckCircle size={48} color="#10b981" />
          <h3>Success!</h3>
          <p>Your action was completed successfully</p>
        </div>
      )}
    </form>
  );
};

const EnhancedInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  icon: Icon,
  validation,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationState, setValidationState] = useState('');

  useEffect(() => {
    if (validation && value) {
      const isValid = validation(value);
      setValidationState(isValid ? 'success' : 'error');
    } else {
      setValidationState('');
    }
  }, [value, validation]);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`form-group enhanced ${isFocused ? 'focused' : ''} ${validationState}`}>
      <label className={`floating-label ${value || isFocused ? 'active' : ''}`}>
        {Icon && <Icon size={16} />}
        {label}
        {required && <span className="required">*</span>}
      </label>
      
      <div className="input-wrapper">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          className={`enhanced-input ${validationState}`}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        
        {validationState === 'success' && (
          <CheckCircle size={16} className="validation-icon success" />
        )}
        
        {validationState === 'error' && (
          <AlertCircle size={16} className="validation-icon error" />
        )}
      </div>
      
      <div className="input-underline"></div>
    </div>
  );
};

const EnhancedButton = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  loading = false,
  icon: Icon,
  onClick,
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (e) => {
    createRipple(e);
    if (onClick) onClick(e);
  };

  return (
    <button
      type={type}
      className={`enhanced-button ${variant} ${size} ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={loading}
      {...props}
    >
      <span className="button-content">
        {Icon && !loading && <Icon size={16} />}
        {loading && <div className="spinner"></div>}
        {children}
      </span>
      
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
        />
      ))}
    </button>
  );
};

const ProgressSteps = ({ steps, currentStep }) => {
  return (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <div 
          key={index}
          className={`step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
        >
          <div className="step-indicator">
            {index < currentStep ? (
              <CheckCircle size={16} />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <span className="step-label">{step}</span>
        </div>
      ))}
      
      <div className="progress-line">
        <div 
          className="progress-fill"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

const SmartSuggestion = ({ message, type = 'info', onAction, actionLabel }) => {
  return (
    <div className={`ai-suggestion ${type}`}>
      <div className="ai-icon">
        <Sparkles size={16} />
      </div>
      <div className="suggestion-content">
        <p>{message}</p>
        {onAction && (
          <button className="suggestion-action" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export { EnhancedForm, EnhancedInput, EnhancedButton, ProgressSteps, SmartSuggestion };