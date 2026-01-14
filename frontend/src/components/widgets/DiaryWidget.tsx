'use client';

import React from 'react';
import { PenLine } from 'lucide-react';

const DiaryWidget: React.FC = () => {
    return (
        <div className="minimal-card h-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-label">DIARY</h3>
                <button className="minimal-btn" style={{ border: 'none', padding: 0 }}>
                    <PenLine size={18} />
                </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ cursor: 'pointer' }}>
                     <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>Today</div>
                    <p className="text-body">
                        디자인을 다시 갈아엎었다. 훨씬 깔끔해져서 마음이 편안하다. 이게 바로 &quot;Simple is Best&quot;.
                    </p>
                </div>
                
                <div style={{ cursor: 'pointer', opacity: 0.6 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Yesterday</div>
                    <p className="text-body">
                        강남 맛집 탐방 완료. 파스타가 정말 훌륭했다.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DiaryWidget;
