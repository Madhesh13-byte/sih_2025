import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ResumeProvider } from './context/ResumeContext';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import './App.css';

function App() {
  return (
    <ResumeProvider>
      <ResumeBuilderPage />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </ResumeProvider>
  );
}

export default App;
