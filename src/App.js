import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import HomeScreen from './components/HomeScreen';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import { auth } from './components/firebase';
import { login, logout, selectUser } from './features/userSlice';
import ProfileScreen from './components/ProfileScreen';


function App() {

  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      
      if (userAuth) {
        dispatch(login({
          uid: userAuth.uid,
          email: userAuth.email,
        }))
      } else {
        //logged out
        dispatch(logout());
      }
    });
    return unsubscribe;
  }, [dispatch]);

  return (
    <div className="App">
     
     {!user ? (
      <LoginScreen />
     ) : (
      <Router>
      <Routes>
        <Route path="/" element={<HomeScreen/>} />
        <Route path="/profileScreen" element={<ProfileScreen/>} />
        
      </Routes>
    </Router>
     )}
  
    
  


    </div>
  );
}

export default App;
