import DashboardLayout from './components/layout/DashboardLayout';
import WeatherWidget from './components/widgets/WeatherWidget';
import TodoWidget from './components/widgets/TodoWidget';
import CalendarWidget from './components/widgets/CalendarWidget';
import DiaryWidget from './components/widgets/DiaryWidget';
import MapWidget from './components/widgets/MapWidget';
import Login from './components/auth/Login';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#121212', 
        color: 'var(--text-muted)' 
      }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', gridAutoRows: 'minmax(240px, auto)' }}>

        {/* 날씨 위젯: 1열 - 정사각형 */}
        <div style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
          <WeatherWidget />
        </div>

        {/* 할 일 목록: 1열 - 세로로 긴 형태 */}
        <div style={{ gridColumn: 'span 1', gridRow: 'span 2' }}>
          <TodoWidget />
        </div>

        {/* 캘린더: 2열 - 가로로 긴 형태 (2칸 차지) */}
        <div style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
          <CalendarWidget />
        </div>

        {/* 일기장: 1열 - 정사각형 (날씨 아래) */}
        <div style={{ gridColumn: 'span 1', gridRow: 'span 1' }}>
          <DiaryWidget />
        </div>

        {/* 지도: 4열 전체 (맨 아래) */}
        <div style={{ gridColumn: 'span 4', gridRow: 'span 2', minHeight: '400px' }}>
          <MapWidget />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App;
