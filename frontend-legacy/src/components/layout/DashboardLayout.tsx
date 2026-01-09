
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../index.css';

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
    hour12: true // 12시간제 (오전/오후)
  });

  return (
    <div className="layout-container" style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header className="flex justify-between items-end mb-4" style={{ marginBottom: '60px' }}>
        <div>
          <h1 className="text-h1" style={{ marginBottom: '8px' }}>
            Life Dashboard.
          </h1>
          <p className="text-body">오늘 하루도 차분하게, 찬희님</p>
        </div>
        <div className="text-right" style={{ color: 'var(--text-muted)', fontWeight: 300 }}>
          <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{formattedDate}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-main)' }}>{formattedTime}</div>
        </div>
      </header>
      
      <main>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
