import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grow,
    useTheme,
    keyframes
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Keyframe animations
const gradientAnimation = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

const floatParticle = keyframes`
    0% {
        transform: translateY(0) translateX(0) scale(1);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateY(-120px) translateX(30px) scale(0.5);
        opacity: 0;
    }
`;

const pulseGlow = keyframes`
    0%, 100% {
        opacity: 0.3;
        transform: scale(1);
    }
    50% {
        opacity: 0.6;
        transform: scale(1.05);
    }
`;

const shimmer = keyframes`
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
`;

const AnimatedStatCard = ({
    title,
    value,
    prefix = '',
    suffix = '',
    icon: IconComponent,
    trend,
    trendValue,
    bgColor = '#667eea',
    secondaryColor = '#764ba2',
    animationType = 'gradient', // 'gradient', 'particles', 'waves', 'glow'
    delay = 0,
}) => {
    const theme = useTheme();
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Number count-up animation
    useEffect(() => {
        setIsVisible(true);

        if (value) {
            const numericValue = parseFloat(value);
            if (isNaN(numericValue)) {
                setDisplayValue(value);
                return;
            }

            const duration = 2000;
            const steps = 60;
            const increment = numericValue / steps;
            let current = 0;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                current += increment;

                if (step >= steps) {
                    setDisplayValue(numericValue);
                    clearInterval(timer);
                } else {
                    setDisplayValue(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [value]);

    // Generate particles
    const renderParticles = () => {
        return Array.from({ length: 8 }).map((_, index) => (
            <Box
                key={index}
                sx={{
                    position: 'absolute',
                    bottom: Math.random() * 20 + '%',
                    left: Math.random() * 100 + '%',
                    width: Math.random() * 8 + 4 + 'px',
                    height: Math.random() * 8 + 4 + 'px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.6)',
                    animation: `${floatParticle} ${Math.random() * 3 + 3}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                }}
            />
        ));
    };

    // Get background style based on animation type
    const getBackgroundStyle = () => {
        const baseGradient = `linear-gradient(135deg, ${bgColor}, ${secondaryColor})`;

        switch (animationType) {
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${bgColor}, ${secondaryColor}, ${bgColor})`,
                    backgroundSize: '200% 200%',
                    animation: `${gradientAnimation} 6s ease infinite`,
                };
            case 'particles':
                return {
                    background: baseGradient,
                };
            case 'waves':
                return {
                    background: baseGradient,
                    position: 'relative',
                    overflow: 'hidden',
                };
            case 'glow':
                return {
                    background: baseGradient,
                };
            default:
                return {
                    background: baseGradient,
                };
        }
    };

    return (
        <Grow in={isVisible} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
            <Card
                sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    ...getBackgroundStyle(),
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: `0 12px 40px ${bgColor}66`,
                        '& .stat-icon-box': {
                            transform: 'rotate(360deg) scale(1.1)',
                        },
                        '& .shimmer-overlay': {
                            animation: `${shimmer} 2s linear`,
                        }
                    },
                }}
            >
                {/* Animated Particles Background */}
                {animationType === 'particles' && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            overflow: 'hidden',
                            pointerEvents: 'none',
                        }}
                    >
                        {renderParticles()}
                    </Box>
                )}

                {/* Animated Waves Background */}
                {animationType === 'waves' && (
                    <>
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '200%',
                                height: '100px',
                                background: `linear-gradient(transparent, ${secondaryColor}40)`,
                                borderRadius: '50%',
                                animation: `${pulseGlow} 4s ease-in-out infinite`,
                                animationDelay: '0s',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -20,
                                right: -50,
                                width: '150px',
                                height: '150px',
                                background: `radial-gradient(circle, ${secondaryColor}60, transparent)`,
                                borderRadius: '50%',
                                animation: `${pulseGlow} 3s ease-in-out infinite`,
                                animationDelay: '0.5s',
                            }}
                        />
                    </>
                )}

                {/* Glowing Orbs Background */}
                {animationType === 'glow' && (
                    <>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -30,
                                right: -30,
                                width: '120px',
                                height: '120px',
                                background: `radial-gradient(circle, rgba(255,255,255,0.3), transparent)`,
                                borderRadius: '50%',
                                animation: `${pulseGlow} 3s ease-in-out infinite`,
                                filter: 'blur(15px)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -40,
                                left: -40,
                                width: '150px',
                                height: '150px',
                                background: `radial-gradient(circle, rgba(255,255,255,0.2), transparent)`,
                                borderRadius: '50%',
                                animation: `${pulseGlow} 4s ease-in-out infinite`,
                                animationDelay: '1s',
                                filter: 'blur(20px)',
                            }}
                        />
                    </>
                )}

                {/* Shimmer Overlay */}
                <Box
                    className="shimmer-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        backgroundSize: '1000px 100%',
                        pointerEvents: 'none',
                    }}
                />

                <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                    {/* Header with Icon */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 2
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.95)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                        >
                            {title}
                        </Typography>

                        {IconComponent && (
                            <Box
                                className="stat-icon-box"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 52,
                                    height: 52,
                                    borderRadius: 2.5,
                                    background: 'rgba(255,255,255,0.25)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                <IconComponent
                                    sx={{
                                        fontSize: 30,
                                        color: 'white',
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Animated Value */}
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            mb: 1.5,
                            color: 'white',
                            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {prefix}
                        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
                        {suffix}
                    </Typography>

                    {/* Trend Indicator */}
                    {trend && (
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 1,
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1.5,
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            {trend === 'up' ? (
                                <TrendingUpIcon
                                    sx={{
                                        fontSize: 18,
                                        color: 'white',
                                        animation: `${pulseGlow} 2s ease-in-out infinite`,
                                    }}
                                />
                            ) : (
                                <TrendingDownIcon
                                    sx={{
                                        fontSize: 18,
                                        color: 'white',
                                        animation: `${pulseGlow} 2s ease-in-out infinite`,
                                    }}
                                />
                            )}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                }}
                            >
                                {trendValue}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Grow>
    );
};

AnimatedStatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    icon: PropTypes.elementType,
    trend: PropTypes.oneOf(['up', 'down']),
    trendValue: PropTypes.string,
    bgColor: PropTypes.string,
    secondaryColor: PropTypes.string,
    animationType: PropTypes.oneOf(['gradient', 'particles', 'waves', 'glow']),
    delay: PropTypes.number,
};

export default AnimatedStatCard;
