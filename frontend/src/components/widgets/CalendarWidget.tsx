'use client';

import React, { useState, useEffect } from 'react';
import { 
    format, 
    parseISO,
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isToday, 
    addMonths, 
    subMonths, 
    startOfWeek, 
    endOfWeek, 
    isSameMonth,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Edit2, Check, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// 2026년 한국 공휴일 (매칭을 위해 키 형식을 표준화)
const HOLIDAYS_2026: Record<string, string> = {
    '2026-01-01': '신정',
    '2026-02-16': '설날 연휴',
    '2026-02-17': '설날',
    '2026-02-18': '설날 연휴',
    '2026-03-01': '3·1절',
    '2026-03-02': '대체공휴일',
    '2026-05-05': '어린이날',
    '2026-05-24': '부처님 오신 날',
    '2026-05-25': '대체공휴일',
    '2026-06-03': '지방선거일',
    '2026-06-06': '현충일',
    '2026-08-15': '광복절',
    '2026-08-17': '대체공휴일',
    '2026-09-24': '추석 연휴',
    '2026-09-25': '추석',
    '2026-09-26': '추석 연휴',
    '2026-10-03': '개천절',
    '2026-10-05': '대체공휴일',
    '2026-10-09': '한글날',
    '2026-12-25': '성탄절',
};

// 2026년 일본 공휴일
const JP_HOLIDAYS_2026: Record<string, string> = {
    '2026-01-01': '元日',
    '2026-01-12': '成人の日',
    '2026-02-11': '建国記念の日',
    '2026-02-23': '天皇誕生日',
    '2026-03-20': '春分の日',
    '2026-04-29': '昭和の日',
    '2026-05-03': '憲法記念日',
    '2026-05-04': 'みどりの日',
    '2026-05-05': 'こどもの日',
    '2026-05-06': '振替休日',
    '2026-07-20': '海の日',
    '2026-08-11': '山の日',
    '2026-09-21': '敬老の日',
    '2026-09-22': '国民の休日',
    '2026-09-23': '秋分の日',
    '2026-10-12': 'スポーツの日',
    '2026-11-03': '文化の日',
    '2026-11-23': '勤労感謝の日',
};

interface CalendarEvent {
    id: string;
    title: string;
    event_date: string;
    color: string;
}

// 오전/오후 표시용 시간 라벨 포맷
const formatTimeLabel = (isoString: string): string => {
    try {
        return format(parseISO(isoString), 'a h:mm', { locale: ko });
    } catch {
        return '';
    }
};

// 현재 시간을 HH:mm 형식으로 반환
const getNowTimeValue = (): string => {
    const now = new Date();
    return format(now, 'HH:mm');
};

// 편집용 시간 입력 기본값을 HH:mm으로 변환
const getEventTimeValue = (isoString: string): string => {
    try {
        return format(parseISO(isoString), 'HH:mm');
    } catch {
        return getNowTimeValue();
    }
};

type ParsedEventInput = {
    hours: number;
    minutes: number;
    title: string;
};

// 시간 입력이 비어 있거나 사용자 텍스트에 섞여 있을 때를 대비해 시간/제목을 보정
const parseTimeParts = (rawValue: string): { hours: number; minutes: number } | null => {
    const raw = rawValue.trim();
    if (!raw) return null;

    const timeMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
        const hours = Number(timeMatch[1]);
        const minutes = Number(timeMatch[2]);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return { hours, minutes };
        }
    }

    const meridiemHeadMatch = raw.match(/^(오전|오후|AM|PM)\s*(\d{1,2})(?::(\d{2}))?$/i);
    if (meridiemHeadMatch) {
        const meridiem = meridiemHeadMatch[1].toLowerCase();
        const rawHours = Number(meridiemHeadMatch[2]);
        const minutes = Number(meridiemHeadMatch[3] ?? '0');
        if (rawHours >= 1 && rawHours <= 12 && minutes >= 0 && minutes <= 59) {
            const isPm = meridiem === '오후' || meridiem === 'pm';
            const hours = rawHours % 12 + (isPm ? 12 : 0);
            return { hours, minutes };
        }
    }

    const meridiemTailMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(오전|오후|AM|PM)$/i);
    if (meridiemTailMatch) {
        const rawHours = Number(meridiemTailMatch[1]);
        const minutes = Number(meridiemTailMatch[2] ?? '0');
        const meridiem = meridiemTailMatch[3].toLowerCase();
        if (rawHours >= 1 && rawHours <= 12 && minutes >= 0 && minutes <= 59) {
            const isPm = meridiem === '오후' || meridiem === 'pm';
            const hours = rawHours % 12 + (isPm ? 12 : 0);
            return { hours, minutes };
        }
    }

    return null;
};

const parseEventInput = (timeValue: string, titleValue: string): ParsedEventInput => {
    const normalizedTitle = titleValue.trim();
    const directTime = parseTimeParts(timeValue);
    if (directTime) {
        return { ...directTime, title: normalizedTitle };
    }

    // "오전/오후 2:00 일정" 또는 "2:00 일정" 패턴을 지원
    const meridiemMatch = normalizedTitle.match(/^(오전|오후|AM|PM)\s*(\d{1,2})(?::(\d{2}))?\s+(.*)$/i);
    if (meridiemMatch) {
        const meridiem = meridiemMatch[1].toLowerCase();
        const rawHours = Number(meridiemMatch[2]);
        const minutes = Number(meridiemMatch[3] ?? '0');
        const title = meridiemMatch[4].trim();
        if (rawHours >= 1 && rawHours <= 12 && minutes >= 0 && minutes <= 59) {
            const isPm = meridiem === '오후' || meridiem === 'pm';
            const hours = rawHours % 12 + (isPm ? 12 : 0);
            return { hours, minutes, title };
        }
    }

    const twentyFourMatch = normalizedTitle.match(/^(\d{1,2}):(\d{2})\s+(.*)$/);
    if (twentyFourMatch) {
        const hours = Number(twentyFourMatch[1]);
        const minutes = Number(twentyFourMatch[2]);
        const title = twentyFourMatch[3].trim();
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return { hours, minutes, title };
        }
    }

    return { hours: 0, minutes: 0, title: normalizedTitle };
};

const CalendarWidget: React.FC = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventTime, setNewEventTime] = useState('09:00');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        
        const fetchData = async () => {
            const startIso = startOfMonth(currentDate).toISOString();
            const endOfMonthDate = endOfMonth(currentDate);
            endOfMonthDate.setHours(23,59,59,999);
            const endIso = endOfMonthDate.toISOString();

            try {
                const { data, error } = await supabase
                    .from('calendar_events')
                    .select('*')
                    .eq('user_id', user.id)
                    .gte('event_date', startIso)
                    .lte('event_date', endIso);

                if (error) {
                    console.error('Supabase fetch error full object:', JSON.stringify(error, null, 2));
                    console.error('Supabase error message:', error.message);
                    
                    if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
                        setErrorMsg('DB 테이블이 존재하지 않습니다. SQL을 먼저 실행해주세요.');
                    } else {
                        setErrorMsg(error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
                    }
                    setEvents([]);
                } else {
                    setEvents(data || []);
                    setErrorMsg(null);
                }
            } catch (err) {
                console.error('Unexpected fetch error:', err);
                setEvents([]);
            }
        };

        fetchData();
    }, [user, currentDate]);

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const handleDateClick = (day: Date) => {
        setSelectedDate(day);
        // 일정 등록 시 기본 시간을 현재 시간으로 설정
        setNewEventTime(getNowTimeValue());
        setIsModalOpen(true);
    };

    const addEvent = async () => {
        const parsedInput = parseEventInput(newEventTime, newEventTitle);
        if (!user || !selectedDate || !parsedInput.title) return;

        const { hours, minutes, title } = parsedInput;
        const eventDateTime = new Date(selectedDate);
        eventDateTime.setHours(hours, minutes, 0, 0);

        const { data, error } = await supabase
            .from('calendar_events')
            .insert([
                {
                    user_id: user.id,
                    title,
                    event_date: eventDateTime.toISOString(),
                    color: '#818cf8'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error adding event:', error);
            alert('일정 추가에 실패했습니다. 테이블이 생성되었는지 확인해주세요.');
        } else {
            setEvents([...events, data]);
            setNewEventTitle('');
            setIsModalOpen(false);
        }
    };

    const deleteEvent = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        const { data, error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)
            .select('id');

        if (error) {
            console.error('Error deleting event:', error);
            alert('일정 삭제에 실패했습니다. 콘솔을 확인하세요.');
        } else if (!data || data.length === 0) {
            console.warn('No rows deleted for calendar event', { id, user_id: user.id });
            alert('삭제 권한이 없거나 이미 삭제된 일정입니다.');
        } else {
            setEvents(events.filter(event => event.id !== id));
        }
    };

    // Edit event state
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingTime, setEditingTime] = useState(getNowTimeValue());

    const startEdit = (e: CalendarEvent) => {
        setEditingEventId(e.id);
        setEditingTitle(e.title);
        // 수정 시 현재 시간으로 표시
        setEditingTime(getNowTimeValue());
    };

    const cancelEdit = () => {
        setEditingEventId(null);
        setEditingTitle('');
        setEditingTime(getNowTimeValue());
    };

    const saveEdit = async (id: string) => {
        if (!editingTitle.trim()) return;
        const targetEvent = events.find(ev => ev.id === id);
        if (!targetEvent) return;
        const [hours, minutes] = (editingTime || '00:00').split(':').map(Number);
        const eventDateTime = new Date(targetEvent.event_date);
        if (!Number.isNaN(eventDateTime.getTime())) {
            eventDateTime.setHours(hours, minutes, 0, 0);
        }
        const { data, error } = await supabase
            .from('calendar_events')
            .update({
                title: editingTitle.trim(),
                event_date: Number.isNaN(eventDateTime.getTime()) ? targetEvent.event_date : eventDateTime.toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating event:', error);
            alert('일정 수정에 실패했습니다. 콘솔을 확인하세요.');
        } else {
            setEvents(events.map(ev => ev.id === id ? data : ev));
            cancelEdit();
        }
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // 선택된 날짜의 공휴일 정보 계산
    const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const selectedHoliday = selectedDateStr ? HOLIDAYS_2026[selectedDateStr] : undefined;
    const selectedJpHoliday = selectedDateStr ? JP_HOLIDAYS_2026[selectedDateStr] : undefined;

    // --- 스타일링 객체 (CSS-in-JS) ---
    const styles = {
        container: {
            backgroundColor: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column' as const,
            overflow: 'hidden',
            position: 'relative' as const,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        },
        weekHeader: {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            flex: 1,
            backgroundColor: 'transparent'
        },
        dayCell: (isOtherMonth: boolean) => ({
            padding: '8px',
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column' as const,
            borderRight: '1px solid rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            cursor: 'pointer',
            backgroundColor: isOtherMonth ? 'rgba(0,0,0,0.1)' : 'transparent',
            transition: 'background-color 0.2s',
            position: 'relative' as const
        }),
        eventChip: {
            fontSize: '0.6rem', 
            color: '#e4e4e7', 
            backgroundColor: 'rgba(129, 140, 248, 0.15)', 
            padding: '2px 4px', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        eventTime: {
            marginRight: '6px',
            fontSize: '0.65rem',
            opacity: 0.95,
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums'
        },
        eventTitle: {
            minWidth: 0,
            position: 'relative' as const,
            top: '-0.135px',
            left: '-4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', backgroundColor: 'rgba(129, 140, 248, 0.1)', borderRadius: '12px', color: '#818cf8' }}>
                        <CalendarIcon size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>
                            {format(currentDate, 'MMMM', { locale: ko })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            {format(currentDate, 'yyyy')}년
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* 공휴일 범례 */}
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.65rem', fontWeight: 600, marginRight: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                            <span style={{ color: '#ef4444' }}>한국 공휴일</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f472b6' }} />
                            <span style={{ color: '#f472b6' }}>일본 공휴일</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <button onClick={prevMonth} style={{ padding: '6px', cursor: 'pointer', background: 'none', border: 'none', color: '#a1a1aa' }}>
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={nextMonth} style={{ padding: '6px', cursor: 'pointer', background: 'none', border: 'none', color: '#a1a1aa' }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Week Header */}
            <div style={styles.weekHeader}>
                {weekDays.map((d, i) => (
                    <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : '#a1a1aa' }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div style={styles.grid}>
                {calendarDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const holiday = HOLIDAYS_2026[dateStr];
                    const jpHoliday = JP_HOLIDAYS_2026[dateStr];
                    const dayEvents = events.filter(e => {
                        try {
                            return format(parseISO(e.event_date), 'yyyy-MM-dd') === dateStr;
                        } catch {
                            return e.event_date === dateStr;
                        }
                    });
                    const isOtherMonth = !isSameMonth(day, monthStart);
                    const isTodayNow = isToday(day);
                    const Sunday = day.getDay() === 0;
                    const Saturday = day.getDay() === 6;

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => handleDateClick(day)}
                            style={styles.dayCell(isOtherMonth)}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isOtherMonth ? 'rgba(0,0,0,0.1)' : 'transparent')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    borderRadius: '50%',
                                    fontSize: '0.8rem',
                                    backgroundColor: isTodayNow ? '#818cf8' : 'transparent',
                                    color: isTodayNow ? '#fff' : (holiday || Sunday ? '#ef4444' : jpHoliday ? '#f472b6' : Saturday ? '#3b82f6' : isOtherMonth ? '#3f3f46' : '#f4f4f5'),
                                    fontWeight: isTodayNow ? 700 : 500
                                }}>
                                    {format(day, 'd')}
                                </span>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                    {holiday && (
                                        <span style={{ fontSize: '0.6rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 4px', borderRadius: '4px' }}>
                                            {holiday}
                                        </span>
                                    )}
                                    {jpHoliday && (
                                        <span style={{ fontSize: '0.55rem', color: '#f472b6', backgroundColor: 'rgba(244, 114, 182, 0.1)', padding: '2px 4px', borderRadius: '4px' }}>
                                            {jpHoliday}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* 일정 목록 */}
                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {dayEvents.slice(0, 2).map(e => {
                                    const timeLabel = formatTimeLabel(e.event_date);

                                    return (
                                        <div 
                                            key={e.id} 
                                            style={{ 
                                                ...styles.eventChip,
                                                borderTop: '1px solid transparent',
                                                borderRight: '1px solid transparent',
                                                borderBottom: '1px solid transparent',
                                                borderLeft: `2px solid ${e.color || '#818cf8'}`
                                            }}
                                            title={e.title}
                                        >
                                            <span style={styles.eventTime}>{timeLabel}</span>
                                            <span style={styles.eventTitle}>{e.title}</span>
                                        </div>
                                    );
                                })} 
                                {dayEvents.length > 2 && (
                                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', paddingLeft: '2px' }}>
                                        + {dayEvents.length - 2}개 더
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Error Overlay (Floating) */}
            {errorMsg && (
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '8px 12px', borderRadius: '12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10 }}>
                    <AlertCircle size={14} />
                    DB 연결 확인 필요
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && selectedDate && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, zIndex: 30, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', width: '100%', maxWidth: 'calc(340px + 13rem)', overflow: 'hidden' }}
                        >
                            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 600 }}>{format(selectedDate, 'M월 d일 EEEE', { locale: ko })}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '4px' }}>
                                        {selectedHoliday && <span style={{ color: '#ef4444' }}>🇰🇷 {selectedHoliday}</span>}
                                        {selectedJpHoliday && <span style={{ color: '#f472b6', marginLeft: selectedHoliday ? '8px' : '0' }}>🇯🇵 {selectedJpHoliday}</span>}
                                        {!selectedHoliday && !selectedJpHoliday && '일정 관리'}
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}><X size={20} style={{ transform: 'translateY(2px)' }} /></button>
                            </div>

                            <div style={{ padding: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                                {(() => {
                                    const eventsForDay = events.filter(e => {
                                        try {
                                            return format(parseISO(e.event_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                                        } catch {
                                            return e.event_date === format(selectedDate, 'yyyy-MM-dd');
                                        }
                                    });

                                    if (eventsForDay.length === 0) {
                                        return <div style={{ textAlign: 'center', padding: '20px', color: '#3f3f46', fontSize: '0.9rem' }}>등록된 일정이 없습니다</div>;
                                    }

                                    return eventsForDay.map(e => (
                                        <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '8px' }}>
                                            {editingEventId === e.id ? (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                                                    <input
                                                        type="time"
                                                        value={editingTime}
                                                        onChange={ev => setEditingTime(ev.target.value)}
                                                        step={60}
                                                        style={{ width: '132px', minWidth: '132px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 8px', color: '#fff' }}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editingTitle}
                                                        onChange={ev => setEditingTitle(ev.target.value)}
                                                        style={{ flex: 1, backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 8px', color: '#fff' }}
                                                    />
                                                    <button onClick={() => saveEdit(e.id)} aria-label="저장" title="저장" style={{ background: '#10b981', border: 'none', borderRadius: '8px', padding: '6px 8px', color: '#fff', cursor: 'pointer' }}><Check size={14} style={{ transform: 'translateY(2px)' }} /></button>
                                                    <button onClick={cancelEdit} aria-label="취소" title="취소" style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.8, cursor: 'pointer' }}><X size={14} style={{ transform: 'translateY(2px)' }} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ color: '#e4e4e7', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(() => {
                                                            const label = formatTimeLabel(e.event_date);
                                                            return label ? `${label} ${e.title}` : e.title;
                                                        })()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={(ev) => { ev.stopPropagation(); startEdit(e); }} style={{ background: 'none', border: 'none', color: '#a1a1aa', opacity: 0.9, cursor: 'pointer' }}><Edit2 size={14} /></button>
                                                        <button onClick={(ev) => deleteEvent(e.id, ev)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer' }}><X size={14} /></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ));
                                })()}
                            </div>

                            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <input
                                        type="time"
                                        value={newEventTime}
                                        onChange={e => setNewEventTime(e.target.value)}
                                        step={60}
                                        style={{ width: '136px', minWidth: '120px', flexShrink: 0, height: '40px', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '6px 8px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                                    />
                                    <input 
                                        type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} placeholder="일정 입력..."
                                        style={{ flex: 1, minWidth: 0, height: '40px', boxSizing: 'border-box', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                                        onKeyPress={e => e.key === 'Enter' && addEvent()}
                                    />
                                    <button onClick={addEvent} style={{ backgroundColor: '#818cf8', border: 'none', borderRadius: '10px', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}><Plus size={18} /></button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarWidget;
