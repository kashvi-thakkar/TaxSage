import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { authAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const GoogleLoginButton = ({ type = 'login', onSuccess, onError }) => {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await authAPI.googleAuth({ 
        token: credentialResponse.credential 
      });
      
      if (response.data.token) {
        await login(response.data.token, response.data);
        
        if (response.data.isNewUser) {
          // Handle new user PAN update
          const pan = prompt('Please enter your PAN number to complete registration:');
          if (pan && pan.trim()) {
            try {
              await authAPI.updatePan({ pan: pan.trim() });
              alert('PAN updated successfully! Your registration is complete.');
            } catch (error) {
              alert(error.response?.data?.message || 'Failed to update PAN. You can update it later in your profile.');
            }
          }
        }
        
        onSuccess?.(response.data);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      const errorMessage = error.response?.data?.message || 'Google login failed. Please try again.';
      onError?.(errorMessage);
      alert(errorMessage);
    }
  };

  const handleError = () => {
    console.log('Google Login Failed');
    const errorMessage = 'Google login failed. Please try again.';
    onError?.(errorMessage);
    alert(errorMessage);
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        text={type === 'login' ? 'continue_with' : 'signup_with'}
        shape="rectangular"
        size="large"
        width="100%"
      />
    </div>
  );
};

export default GoogleLoginButton;