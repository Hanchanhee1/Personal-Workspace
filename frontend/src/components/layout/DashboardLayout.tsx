'use client';

import React, { useState, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import BackgroundEffect from './BackgroundEffect';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user, signOut } = useAuth();
  const router = useRouter();

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
  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.user_metadata?.nickname;

  return (
    <>
      <BackgroundEffect />
      {/* 로그인 버튼 - 헤더 영역에 고정 */}
      <button
        onClick={async () => {
          if (user) {
            // 로그아웃 후 메인 화면 유지
            await signOut();
            window.location.reload();
            return;
          }
          router.push('/login');
        }}
        title={user ? '로그아웃' : '로그인'}
        style={{
          position: 'absolute',
          top: 15,
          right: 15,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          zIndex: 100,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 0 6px rgba(129, 140, 248, 0.7))',
          transition: 'transform 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.15)')}
        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {user ? (
          <LogOut size={30} color="#818cf8" strokeWidth={2} />
        ) : (
          <LogIn size={30} color="#818cf8" strokeWidth={2} />
        )}
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
          paddingRight: '96px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <h1 className="text-h1" style={{ marginBottom: '8px', color: '#fff', textShadow: '0 0 20px rgba(129, 140, 248, 0.3)' }}>
              Personal Workspace.
            </h1>
            <p className="text-body" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              오늘 하루도 차분하게
              {displayName && (
                <>
                  , <span style={{ fontWeight: 700 }}>{displayName}</span>님
                </>
              )}
            </p>
          </div>
          <div className="text-right" style={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 300, transform: 'translate(3.5rem, 1.5rem)' }}>
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
