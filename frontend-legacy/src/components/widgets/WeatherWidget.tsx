import React from 'react';
import { Cloud, Droplets } from 'lucide-react';

const WeatherWidget: React.FC = () => {
    return (
        <div className="minimal-card h-full flex flex-col justify-between p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-label">SEOUL</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 300, lineHeight: 1.1, marginTop: '16px' }}>
                        24°
                    </div>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>
                    <Cloud size={24} />
                </div>
            </div>

            <div>
                <div className="text-body" style={{ color: 'var(--text-main)', marginBottom: '4px' }}>
                    맑음
                </div>
                <div className="flex items-center gap-2 text-label" style={{ fontWeight: 400, opacity: 0.7 }}>
                    <Droplets size={12} />
                    <span>습도 42%</span>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
