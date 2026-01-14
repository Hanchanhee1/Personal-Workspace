
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';

const CalendarWidget: React.FC = () => {
    const [currentDate] = React.useState(new Date());

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
    });

    // 한글 요일 배열 (date-fns로 동적으로 할 수도 있지만 고정값이 깔끔함)
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="minimal-card h-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-h2" style={{ fontWeight: 400, fontSize: '1.5rem' }}>
                    {format(currentDate, 'M월', { locale: ko })}
                </h2>
                <div className="text-label" style={{ fontSize: '0.9rem' }}>
                    {format(currentDate, 'yyyy')}
                </div>
            </div>

            {/* 요일 헤더 */}
            <div 
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)', 
                    textAlign: 'center', 
                    marginBottom: '20px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 400
                }}
            >
                {weekDays.map(d => <div key={d}>{d}</div>)}
            </div>

            {/* 날짜 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '16px', flex: 1 }}>
                {days.map((day) => (
                    <div
                        key={day.toString()}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isToday(day) ? 'var(--accent-primary)' : 'var(--text-main)',
                            fontWeight: isToday(day) ? 600 : 300,
                            cursor: 'default',
                            position: 'relative',
                            opacity: isToday(day) ? 1 : 0.8
                        }}
                    >
                        <span>{format(day, 'd')}</span>
                        {/* 나중에 실제 일정 데이터 연동 시 점 표시 */}
                        {/* 현재는 홀수 날짜에만 테스트용으로 점 표시 */}
                        {parseInt(format(day, 'd')) % 3 === 0 && (
                            <div style={{ 
                                width: '4px', 
                                height: '4px', 
                                background: 'white', 
                                borderRadius: '50%', 
                                marginTop: '4px',
                                opacity: 0.8
                            }} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarWidget;
