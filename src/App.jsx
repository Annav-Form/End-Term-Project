import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Explorer from './pages/Explorer';
import Bookmarks from './pages/Bookmarks';
import Dashboard from './pages/Dashboard';
import HandlePromptModal from './components/HandlePromptModal';
import { useAuthStore } from './store/useAuthStore';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const { setUser, setCfHandle, setBookmarks, setIsAuthLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCfHandle(data.cfHandle || null);
            setBookmarks(data.bookmarks || []);
          } else {
            setCfHandle(null);
            setBookmarks([]);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCfHandle(null);
          setBookmarks([]);
        }
      } else {
        setCfHandle(null);
        setBookmarks([]);
      }
      
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setCfHandle, setBookmarks, setIsAuthLoading]);

  return (
    <Router>
      <HandlePromptModal />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Explorer />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;