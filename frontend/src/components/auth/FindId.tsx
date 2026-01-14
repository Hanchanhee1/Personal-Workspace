"use client";
import React, { useState } from 'react';
import BackgroundEffect from '@/components/layout/BackgroundEffect';

const FindId: React.FC = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    // 실제 서비스에서는 이메일로 아이디를 찾는 API 호출 필요
    setTimeout(() => {
      if (email === 'test@example.com') {
        setResult('아이디: testuser');
      } else {
        setError('해당 이메일로 등록된 아이디가 없습니다.');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      color: '#222',
      position: 'relative',
    }}>
      {/* 대시보드와 동일한 은하수 배경 */}
      <BackgroundEffect />
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
          <div style={{ fontSize: 15, color: '#888', marginBottom: 0 }}>아이디 찾기</div>
        </div>
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 0', background: '#ffeaea', color: '#d32f2f', borderRadius: 8, fontSize: 14, border: '1px solid #ffd6d6' }}>{error}</div>
        )}
        {result && (
          <div style={{ marginBottom: 16, padding: '10px 0', background: '#eaffea', color: '#388e3c', borderRadius: 8, fontSize: 14, border: '1px solid #c8f7c5' }}>{result}</div>
        )}
        <form onSubmit={handleFindId} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="가입한 이메일 입력"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
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
          <button type="submit" disabled={loading} style={{
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
          }}>{loading ? '조회 중...' : '아이디 찾기'}</button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 24, fontSize: 13, color: '#aaa' }}>
          <a href="/" style={{ textDecoration: 'underline', color: '#aaa' }}>로그인</a>
          <a href="/find-password" style={{ textDecoration: 'underline', color: '#aaa' }}>비밀번호 찾기</a>
          <a href="/sign-up" style={{ textDecoration: 'underline', color: '#aaa' }}>회원가입</a>
        </div>
      </div>
    </div>
  );
};

export default FindId;
