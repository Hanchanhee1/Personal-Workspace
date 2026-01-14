'use client';

import { useAuth } from "@/contexts/AuthContext";
import Login from "@/components/auth/Login";
import DashboardLayout from "@/components/layout/DashboardLayout";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import TodoWidget from "@/components/widgets/TodoWidget";
import CalendarWidget from "@/components/widgets/CalendarWidget";
import DiaryWidget from "@/components/widgets/DiaryWidget";
import dynamic from "next/dynamic";
import React from "react";
import styles from "./page.module.css";

// MapWidget은 클라이언트 사이드에서만 렌더링되도록 dynamic import 사용
const MapWidget = dynamic(() => import("@/components/widgets/MapWidget"), { 
    ssr: false,
    loading: () => <div className="minimal-card h-full flex items-center justify-center">Loading Map...</div>
});

export default function Home() {
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

  return (
    <DashboardLayout>
      <div className={styles.dashboardGrid}>
        
        {/* 날씨 위젯: 1열 - 정사각형 */}
        <div className={styles.weatherCard}>
          <WeatherWidget />
        </div>

        {/* 할 일 목록: 1열 - 세로로 긴 형태 */}
        <div className={styles.todoCard}>
          <TodoWidget />
        </div>

        {/* 캘린더: 2열 - 가로로 긴 형태 (2칸 차지) */}
        <div className={styles.calendarCard}>
          <CalendarWidget />
        </div>

        {/* 일기장: 1열 - 정사각형 (날씨 아래) */}
        <div className={styles.diaryCard}>
          <DiaryWidget />
        </div>

        {/* 지도: 4열 전체 (맨 아래) */}
        <div className={styles.mapCard}>
          <MapWidget />
        </div>
      </div>
    </DashboardLayout>
  );
}
