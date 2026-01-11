'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Todo 항목 타입 정의
interface Todo {
    id: string;
    content: string;
    is_completed: boolean;
    created_at: string;
}

const TodoWidget: React.FC = () => {
    const { user } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Supabase에서 Todo 목록 가져오기
    const fetchTodos = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false }); // 최신 날짜가 위로 오게 변경
        
        if (error) console.error('Error fetching todos:', error);
        else setTodos(data || []);
    }, [user]);

    // 컴포넌트 마운트 시 Todo 목록 불러오기
    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // Todo 완료/미완료 토글
    const toggleTodo = async (id: string, currentStatus: boolean) => {
        // 낙관적 업데이트 (즉시 UI 반영)
        setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));

        const { error } = await supabase
            .from('todos')
            .update({ is_completed: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating todo:', error);
            fetchTodos(); // 에러 시 다시 불러오기
        }
    };

    // 새로운 Todo 추가
    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim() || !user) return;

        setIsAdding(true);
        const todoText = newTodo;
        setNewTodo('');

        const { data, error } = await supabase
            .from('todos')
            .insert([
                { 
                    content: todoText, 
                    user_id: user.id 
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error adding todo:', error);
        } else if (data) {
            setTodos([data, ...todos]); // 최상단에 추가
        }
        
        setIsAdding(false);
    };

    // Todo 삭제
    const deleteTodo = async (id: string) => {
        // 낙관적 업데이트
        setTodos(prev => prev.filter(t => t.id !== id));

        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting todo:', error);
            fetchTodos(); // 에러 시 다시 불러오기
        }
    };

    // 할 일을 날짜별로 그룹화하는 함수
    const groupTodosByDate = (todos: Todo[]) => {
        const groups: { [key: string]: Todo[] } = {};
        todos.forEach(todo => {
            const date = todo.created_at.split('T')[0];
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(todo);
        });
        return groups;
    };

    // 미완료 항목 개수 계산
    const incompleteTodos = todos.filter(t => !t.is_completed).length;
    const groupedTodos = groupTodosByDate(todos);
    const sortedDates = Object.keys(groupedTodos).sort((a, b) => b.localeCompare(a)); // 최신 날짜순 정렬

    return (
        <div className="minimal-card h-full flex flex-col p-6 overflow-hidden">
            {/* 헤더 */}
            <motion.div 
                className="flex justify-between items-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h3 className="text-label">TO DO</h3>
                <motion.span 
                    key={incompleteTodos}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                >
                    {incompleteTodos} {incompleteTodos === 1 ? 'item' : 'items'}
                </motion.span>
            </motion.div>

            {/* Todo 목록 */}
            <div className="flex-1 overflow-y-auto pr-2" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--text-muted) transparent'
            }}>
                <AnimatePresence mode="popLayout">
                    {sortedDates.map((date) => (
                        <div key={date} style={{ marginBottom: '16px' }}>
                            {/* 날짜 구분선 */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ 
                                    padding: '8px 12px',
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    fontWeight: 600,
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span>{date}</span>
                                <span style={{ opacity: 0.5, fontWeight: 400 }}>{groupedTodos[date].length} 개</span>
                            </motion.div>

                            {/* 해당 날짜의 Todo들 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {groupedTodos[date].map((todo, index) => (
                                    <motion.div 
                                        key={todo.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20, height: 0 }}
                                        transition={{ 
                                            duration: 0.3,
                                            delay: index * 0.03,
                                            layout: { duration: 0.3 }
                                        }}
                                        className="group"
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '12px',
                                            padding: '10px 12px',
                                            borderRadius: '12px',
                                            background: 'transparent',
                                            transition: 'all 0.2s ease',
                                        }}
                                        whileHover={{ 
                                            background: 'rgba(255, 255, 255, 0.02)',
                                            scale: 1.01
                                        }}
                                    >
                                        {/* 체크박스 */}
                                        <motion.div 
                                            onClick={() => toggleTodo(todo.id, todo.is_completed)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: `2px solid ${todo.is_completed ? 'var(--accent-primary, #818cf8)' : 'rgba(255, 255, 255, 0.2)'}`,
                                                background: todo.is_completed ? 'var(--accent-primary, #818cf8)' : 'transparent',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <AnimatePresence>
                                                {todo.is_completed && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        exit={{ scale: 0, rotate: 180 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <Check size={12} color="white" strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                        
                                        {/* Todo 텍스트 */}
                                        <motion.span 
                                            layout
                                            style={{ 
                                                flex: 1, 
                                                fontSize: '0.9rem', 
                                                textDecoration: todo.is_completed ? 'line-through' : 'none',
                                                color: todo.is_completed ? 'var(--text-muted)' : 'var(--text-main)',
                                                fontWeight: 300,
                                                transition: 'all 0.2s ease',
                                                opacity: todo.is_completed ? 0.4 : 1
                                            }}
                                        >
                                            {todo.content}
                                        </motion.span>
                                        
                                        {/* 삭제 버튼 (호버 시에만 더 잘 보임) */}
                                        <motion.button 
                                            onClick={() => deleteTodo(todo.id)}
                                            whileHover={{ scale: 1.2, color: '#ef4444' }}
                                            whileTap={{ scale: 0.9 }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                color: 'var(--text-muted)',
                                                padding: '4px',
                                            }}
                                        >
                                            <X size={14} />
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </AnimatePresence>

                {/* 빈 상태 메시지 */}
                {todos.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem'
                        }}
                    >
                        할 일을 추가해보세요 ✨
                    </motion.div>
                )}
            </div>

            {/* 입력 폼 */}
            <motion.form 
                onSubmit={addTodo} 
                className="relative" 
                style={{ marginTop: '20px' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="새로운 할 일 추가..."
                    className="minimal-input"
                    style={{ 
                        paddingRight: '40px',
                        transition: 'all 0.2s ease'
                    }}
                    disabled={isAdding}
                />
                <motion.button 
                    type="submit" 
                    className="absolute"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ 
                        right: '8px', 
                        top: 'calc(50% - 1rem)', 
                        transform: 'translateY(-50%)',
                        background: newTodo.trim() ? 'var(--primary-color, #4A90E2)' : 'transparent',
                        border: 'none',
                        color: newTodo.trim() ? 'white' : 'var(--text-muted)',
                        cursor: newTodo.trim() ? 'pointer' : 'not-allowed',
                        borderRadius: '8px',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                    disabled={isAdding || !newTodo.trim()}
                >
                    <Plus size={20} />
                </motion.button>
            </motion.form>
        </div>
    );
};

export default TodoWidget;
