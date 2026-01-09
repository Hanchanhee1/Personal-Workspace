
import React, { useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";
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
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#121212', color: '#ffffff' }}>
      <div className="p-8 pb-12 w-full max-w-md text-center" style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <h1 className="text-h1 mb-4">Life Dashboard</h1>
        <p className="text-body mb-8" style={{ opacity: 0.7 }}>
          가족과 함께하는 소중한 일상 기록
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 text-red-200 rounded-lg text-sm border border-red-900/30">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-900/20 text-green-200 rounded-lg text-sm border border-green-900/30">
            {message}
          </div>
        )}

        {/* 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 px-6 flex items-center justify-center gap-3 transition-all mb-6"
          style={{
            background: 'var(--accent-primary)',
            color: '#121212',
            borderRadius: '16px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? <span>처리 중...</span> : (
            <>
              <LogIn size={20} />
              <span>Google 계정으로 시작하기</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-4 mb-6" style={{ opacity: 0.5 }}>
          <div className="h-px bg-white flex-1" />
          <span className="text-sm">또는 이메일로 시작</span>
          <div className="h-px bg-white flex-1" />
        </div>

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <input 
            type="email" 
            placeholder="이메일 주소 입력" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="minimal-input text-center"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              borderRadius: '16px',
              border: 'none',
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <Mail size={18} />
            <span>로그인 링크 받기</span>
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
