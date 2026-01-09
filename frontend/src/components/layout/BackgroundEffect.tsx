'use client';

import React, { useEffect, useState } from 'react';

interface StarProps {
    id: number;
    top: string;
    left: string;
    size: string;
    duration: string;
    delay: string;
    opacity: number;
}

interface ShootingStarProps {
    id: number;
    top: string;
    left: string;
    duration: string;
    delay: string;
}

const BackgroundEffect: React.FC = () => {
    const [stars, setStars] = useState<StarProps[]>([]);
    const [shootingStars, setShootingStars] = useState<ShootingStarProps[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // 별 생성
        const newStars = Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 2 + 1}px`,
            duration: `${Math.random() * 3 + 2}s`,
            delay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.7 + 0.3,
        }));
        
        // 별똥별 생성 (5개 정도)
        const newShootingStars = Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 80 + 20}%`,
            duration: `${Math.random() * 10 + 10}s`,
            delay: `${Math.random() * 20}s`,
        }));

        setStars(newStars);
        setShootingStars(newShootingStars);
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: -1,
            background: 'radial-gradient(circle at center, var(--space-glow) 0%, var(--space-deep) 100%)',
        }}>
            {/* 성운(Nebula) 효과 */}
            <div className="nebula" style={{
                background: 'radial-gradient(circle at 20% 30%, var(--nebula-purple) 0%, transparent 50%)',
            }} />
            <div className="nebula" style={{
                background: 'radial-gradient(circle at 80% 70%, var(--nebula-blue) 0%, transparent 50%)',
                animationDelay: '-5s',
            }} />

            {/* 별(Stars) 렌더링 */}
            {stars.map((star) => (
                <div
                    key={`star-${star.id}`}
                    className="star"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        '--duration': star.duration,
                        '--opacity': star.opacity,
                        animationDelay: star.delay,
                    } as React.CSSProperties}
                />
            ))}

            {/* 별똥별(Shooting Stars) 렌더링 */}
            {shootingStars.map((s) => (
                <div
                    key={`shooting-${s.id}`}
                    className="shooting-star"
                    style={{
                        top: s.top,
                        left: s.left,
                        '--duration': s.duration,
                        '--delay': s.delay,
                    } as React.CSSProperties}
                />
            ))}

            {/* 은은한 그라디언트 오버레이 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default BackgroundEffect;
