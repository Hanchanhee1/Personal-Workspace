
import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Todo {
    id: string;
    content: string; // text -> content
    is_completed: boolean; // completed -> is_completed
}

const TodoWidget: React.FC = () => {
    const { user } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');

    // 1. 초기 데이터 불러오기
    useEffect(() => {
        if (!user) return;
        fetchTodos();
    }, [user]);

    const fetchTodos = async () => {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (error) console.error('Error fetching todos:', error);
        else setTodos(data || []);
    };

    // 2. 투두 완료 상태 토글 (Update)
    const toggleTodo = async (id: string, currentStatus: boolean) => {
        // UI 낙관적 업데이트 (먼저 반영)
        setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));

        const { error } = await supabase
            .from('todos')
            .update({ is_completed: !currentStatus })
            .eq('id', id);

        if (error) {
            console.error('Error updating todo:', error);
            fetchTodos(); // 실패 시 롤백 (재조회)
        }
    };

    // 3. 투두 추가 (Insert)
    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim() || !user) return;

        const todoText = newTodo;
        setNewTodo(''); // 입력창 비우기

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
            setTodos([...todos, data]); // 상태에 추가
        }
    };

    // 4. 투두 삭제 (Delete)
    const deleteTodo = async (id: string) => {
        setTodos(todos.filter(t => t.id !== id)); // UI 먼저 삭제

        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting todo:', error);
            fetchTodos();
        }
    }

    return (
        <div className="minimal-card h-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-label">TO DO</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {todos.filter(t => !t.is_completed).length} items
                </span>
            </div>

            <div className="flex-1 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {todos.map(todo => (
                    <div 
                        key={todo.id} 
                        className="group"
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '16px',
                            opacity: todo.is_completed ? 0.4 : 1,
                            transition: 'opacity 0.2s'
                        }}
                    >
                        <div 
                            onClick={() => toggleTodo(todo.id, todo.is_completed)}
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: '1px solid var(--text-muted)',
                                background: todo.is_completed ? 'var(--text-muted)' : 'transparent',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        />
                        
                        <span style={{ 
                            flex: 1, 
                            fontSize: '0.95rem', 
                            textDecoration: todo.is_completed ? 'line-through' : 'none',
                            color: 'var(--text-main)',
                            fontWeight: 300
                        }}>
                            {todo.content}
                        </span>
                        
                        <button 
                            onClick={() => deleteTodo(todo.id)} 
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer', 
                                color: 'var(--text-muted)',
                                opacity: 0,
                                transition: 'opacity 0.2s'
                            }}
                            className="group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={addTodo} className="relative" style={{ marginTop: '24px' }}>
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a task..."
                    className="minimal-input"
                    style={{ paddingRight: '32px' }}
                />
                <button 
                    type="submit" 
                    className="absolute"
                    style={{ 
                        right: '0', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer' 
                    }}
                >
                    <Plus size={20} />
                </button>
            </form>
        </div>
    );
};

export default TodoWidget;
