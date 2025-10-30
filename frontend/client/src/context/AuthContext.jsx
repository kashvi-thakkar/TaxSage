<<<<<<< HEAD
import React, { createContext, useState, useEffect, useContext } from 'react'; // Add useContext
import { jwtDecode } from 'jwt-decode';
import { authAPI, checkAuth } from '../services/apiService';

const AuthContext = createContext();

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState(null);

    useEffect(() => {
        const { isAuthenticated, user: savedUser } = checkAuth();
        
        if (isAuthenticated && savedUser) {
            setUser(savedUser);
            
            try {
                const token = localStorage.getItem('token');
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                
                if (decodedToken.exp > currentTime) {
                    // Set auto logout timer
                    const timeout = (decodedToken.exp - currentTime) * 1000;
                    setSessionTimeout(setTimeout(() => {
                        logout();
                    }, timeout - 60000)); // Logout 1 minute before expiry
                } else {
                    logout();
                }
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
=======
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // Fix: Check the actual token structure from your backend
                if (decodedToken && decodedToken.id) {
                    setUser({ 
                        id: decodedToken.id,
                        // Add other user data from localStorage if available
                        ...JSON.parse(localStorage.getItem('user') || '{}')
                    });
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } catch (error) {
                console.error("Invalid token found:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893
            }
        }
        setLoading(false);
    }, []);

<<<<<<< HEAD
    const login = async (token, userData = null) => {
        localStorage.setItem('token', token);
        
        try {
            const decodedToken = jwtDecode(token);
            let userInfo = userData;
            
            // If userData not provided, fetch from backend
            if (!userData) {
                // You might want to add an API to get user profile
                userInfo = { id: decodedToken.id };
            }
            
            setUser(userInfo);
            
            if (userInfo) {
                localStorage.setItem('user', JSON.stringify(userInfo));
            }

            // Clear existing timeout and set new one
            if (sessionTimeout) {
                clearTimeout(sessionTimeout);
            }
            
            const timeout = (decodedToken.exp - (Date.now() / 1000)) * 1000;
            setSessionTimeout(setTimeout(() => {
                logout();
            }, timeout - 60000));

=======
    const login = (token, userData = null) => {
        localStorage.setItem('token', token);
        try {
            const decodedToken = jwtDecode(token);
            const userInfo = userData || { id: decodedToken.id };
            setUser(userInfo);
            
            // Also store user data in localStorage for persistence
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893
        } catch (error) {
            console.error("Invalid token during login:", error);
        }
    };

<<<<<<< HEAD
    const register = async (userData, isCA = false) => {
        try {
            const response = isCA 
                ? await authAPI.registerCA(userData)
                : await authAPI.registerUser(userData);
            
            if (response.data.token) {
                await login(response.data.token, response.data);
                return { success: true, data: response.data };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const loginUser = async (credentials, isEmailOnly = false) => {
        try {
            let response;
            
            if (isEmailOnly) {
                response = await authAPI.emailLogin(credentials.email);
                return { 
                    success: true, 
                    message: 'Check your email for login instructions',
                    data: response.data 
                };
            } else {
                response = await authAPI.loginUser(credentials);
                if (response.data.token) {
                    await login(response.data.token, response.data);
                    return { success: true, data: response.data };
                }
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const loginCA = async (credentials) => {
        try {
            const response = await authAPI.loginCA(credentials);
            if (response.data.token) {
                localStorage.setItem('ca_token', response.data.token);
                localStorage.setItem('ca_user', JSON.stringify(response.data));
                return { success: true, data: response.data };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'CA Login failed' 
            };
        }
    };

    const googleLogin = async (token) => {
        try {
            const response = await authAPI.googleAuth({ token });
            if (response.data.token) {
                await login(response.data.token, response.data);
                return { success: true, data: response.data };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || 'Google login failed' 
            };
        }
    };

=======
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('ca_token');
        localStorage.removeItem('ca_user');
<<<<<<< HEAD
        
        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
            setSessionTimeout(null);
        }
        
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        loginUser,
        loginCA,
        googleLogin,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
=======
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
>>>>>>> 5260d96fe97afffbc6bbfe8f645c3fd745f1d893
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;