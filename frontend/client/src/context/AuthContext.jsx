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
            }
        }
        setLoading(false);
    }, []);

    const login = async (token, userData = null) => {
        localStorage.setItem('token', token);
        
        try {
            const decodedToken = jwtDecode(token);
            let userInfo = userData;
            
            // If userData not provided, use decoded token
            if (!userData) {
                userInfo = { 
                    id: decodedToken.id,
                    // You should fetch the full user profile here
                    // This is a fallback
                };
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
            }, timeout - 60000)); // Logout 1 min before expiry

        } catch (error) {
            console.error("Invalid token during login:", error);
        }
    };

    const register = async (userData, isCA = false) => {
        try {
            const response = isCA 
                ? await authAPI.registerCA(userData)
                : await authAPI.registerUser(userData);
            
            if (response.data.token && !isCA) {
                // Only auto-login for regular users
                await login(response.data.token, response.data);
                return { success: true, data: response.data };
            } else if (isCA) {
                // For CAs, just return success
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
                // We don't call login() for CAs, as it's a separate auth context
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

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('ca_token');
        localStorage.removeItem('ca_user');
        
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
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;