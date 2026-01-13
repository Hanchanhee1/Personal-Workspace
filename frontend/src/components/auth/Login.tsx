'use client';

import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      await signInWithEmail(email);
      setMessage('이메일로 로그인 링크를 보냈습니다! 메일함을 확인해주세요.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '이메일 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#121212',
      color: '#222',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 18,
        border: '1.5px solid #e5e7eb22',
        boxShadow: '0 2px 16px 0 rgba(0,0,0,0.08)',
        padding: '40px 32px 32px 32px',
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-1px', color: '#6C63FF', marginBottom: 4 }}>ARCHIVE</h1>
          <div style={{ fontSize: 15, color: '#888', marginBottom: 0 }}>나만의 워크스페이스 로그인</div>
        </div>

        {/* 탭 메뉴 (단일 탭만, 확장 대비) */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 12, overflow: 'hidden', background: '#f7f7f7', border: '1px solid #e5e7eb' }}>
          <div style={{ flex: 1, background: '#fff', color: '#00c73c', fontWeight: 700, padding: '10px 0', fontSize: 15, border: 'none', outline: 'none', cursor: 'default', textAlign: 'center' }}>이메일 로그인</div>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 0', background: '#ffeaea', color: '#d32f2f', borderRadius: 8, fontSize: 14, border: '1px solid #ffd6d6' }}>{error}</div>
        )}
        {message && (
          <div style={{ marginBottom: 16, padding: '10px 0', background: '#eaffea', color: '#388e3c', borderRadius: 8, fontSize: 14, border: '1px solid #c8f7c5' }}>{message}</div>
        )}

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="이메일 주소 입력"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: 16,
              border: '1.5px solid #e5e7eb',
              borderRadius: 10,
              outline: 'none',
              marginBottom: 8,
              background: '#fff',
              color: '#222',
              boxSizing: 'border-box',
              transition: 'border 0.2s',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 0',
              background: loading ? '#bdbdbd' : '#6C63FF',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 17,
              marginBottom: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
              transition: 'background 0.2s',
            }}
          >
            {/* <Mail size={18} style={{ marginRight: 6, verticalAlign: -2 }} /> */}
            로그인 링크 받기
          </button>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 4, marginTop: -2, textAlign: 'left' }}>
            <span style={{ color: '#6C63FF', fontWeight: 600 }}>로그인 링크 받기란?</span> 입력한 이메일로 로그인용 링크가 전송됩니다.<br />메일함에서 링크를 클릭하면 바로 로그인됩니다.
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0 10px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ margin: '0 12px', color: '#bbb', fontSize: 13 }}>또는</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px 0',
            background: '#fff',
            color: '#222',
            border: '1.5px solid #e5e7eb',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 17,
            marginBottom: 0,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_17_40)">
                <path d="M47.532 24.552c0-1.636-.147-3.192-.419-4.68H24.48v9.12h13.008c-.56 2.96-2.24 5.456-4.768 7.144v5.92h7.712c4.52-4.16 7.1-10.288 7.1-17.504z" fill="#4285F4"/>
                <path d="M24.48 48c6.48 0 11.92-2.144 15.888-5.832l-7.712-5.92c-2.144 1.44-4.88 2.288-8.176 2.288-6.288 0-11.616-4.256-13.528-9.968H2.56v6.16C6.52 43.36 14.04 48 24.48 48z" fill="#34A853"/>
                <path d="M10.952 28.568A13.98 13.98 0 0 1 9.44 24c0-1.584.28-3.128.784-4.568v-6.16H2.56A23.98 23.98 0 0 0 0 24c0 3.92.944 7.624 2.56 10.728l8.392-6.16z" fill="#FBBC05"/>
                <path d="M24.48 9.52c3.528 0 6.656 1.216 9.136 3.584l6.832-6.832C36.392 2.144 30.96 0 24.48 0 14.04 0 6.52 4.64 2.56 13.272l8.392 6.16c1.912-5.712 7.24-9.968 13.528-9.968z" fill="#EA4335"/>
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="48" height="48" fill="#fff"/>
                </clipPath>
              </defs>
            </svg>
          </span>
          <span>Google 계정으로 시작하기</span>
        </button>

        {/* 하단 링크들 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 24, fontSize: 13, color: '#aaa' }}>
          <a href="/find-id" style={{ textDecoration: 'underline', color: '#aaa' }}>아이디 찾기</a>
          <a href="/find-password" style={{ textDecoration: 'underline', color: '#aaa' }}>비밀번호 찾기</a>
          <a href="/sign-up" style={{ textDecoration: 'underline', color: '#aaa' }}>회원가입</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
