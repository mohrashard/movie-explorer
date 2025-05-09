import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);


  const register = (email, password, name) => {

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      throw new Error('User already exists');
    }
    
    const newUser = { id: Date.now().toString(), email, password, name };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    

    setCurrentUser({ id: newUser.id, email: newUser.email, name: newUser.name });
    localStorage.setItem('currentUser', JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    }));
    
    return newUser;
  };

  // Login function
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(user => user.email === email && user.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    setCurrentUser({ id: user.id, email: user.email, name: user.name });
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name
    }));
    
    return user;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;