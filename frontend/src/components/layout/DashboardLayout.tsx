'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import BackgroundEffect from './BackgroundEffect';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { signOut } = useAuth();

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
      {/* 로그아웃 별 버튼 - 백그라운드 오른쪽 상단 고정 */}
      <button
        onClick={signOut}
        title="로그아웃"
        style={{
          position: 'fixed',
          top: 32,
          right: 48,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          zIndex: 100,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 0 8px #ffe06688) drop-shadow(0 0 2px #fff8)',
          transition: 'transform 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.15)')}
        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Star size={36} color="#FFD600" fill="#FFD600" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 6px #FFD60088)' }} />
      </button>
      <div className="layout-container" style={{ 
        padding: '60px 40px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <header className="flex justify-between items-end mb-4 relative" style={{ 
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
          {/* ...existing code... */}
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
