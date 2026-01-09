'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BackgroundEffect from './BackgroundEffect';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDate.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });

  const formattedTime = currentDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <>
      <BackgroundEffect />
      <div className="layout-container" style={{ 
        padding: '60px 40px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <header className="flex justify-between items-end mb-4" style={{ 
          marginBottom: '60px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          padding: '24px 32px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <h1 className="text-h1" style={{ marginBottom: '8px', color: '#fff', textShadow: '0 0 20px rgba(129, 140, 248, 0.3)' }}>
              Personal Workspace.
            </h1>
            <p className="text-body" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>오늘 하루도 차분하게, 찬희님</p>
          </div>
          <div className="text-right" style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 300 }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{formattedDate}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 500, color: '#fff' }}>{formattedTime}</div>
          </div>
        </header>
        
        <main>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
