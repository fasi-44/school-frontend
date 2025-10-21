import { useEffect, useCallback, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
// import { toast } from 'react-toastify';
// import { clearAllSiteData } from 'shared/SharedService';

const IdleTimeoutHandler = ({
    idleTime = 900,          // seconds (15 min)
    modalCountdown = 60,     // seconds for modal countdown
    onLogout,
    isLoggedIn = false
}) => {
    const lastActivityRef = useRef(Date.now());
    const idleTimeoutRef = useRef(null);
    const modalTimeoutRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(modalCountdown);

    const clearTimers = () => {
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        if (modalTimeoutRef.current) clearInterval(modalTimeoutRef.current);
    };

    const logout = useCallback(async () => {
        clearTimers();
        // toast.warn('Session expired. Logging out...');
        try {
            if (onLogout) await onLogout();
            // await clearAllSiteData();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [onLogout]);

    const resetIdleTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        clearTimers();
        setShowModal(false);
        setCountdown(modalCountdown);

        idleTimeoutRef.current = setTimeout(() => {
            setShowModal(true);
            // Start modal countdown
            let remaining = modalCountdown;
            setCountdown(remaining);

            modalTimeoutRef.current = setInterval(() => {
                remaining -= 1;
                setCountdown(remaining);
                if (remaining <= 0) {
                    logout();
                }
            }, 1000);
        }, idleTime * 1000);
    }, [idleTime, modalCountdown, logout]);


    // useEffect(() => {
    //     if (isLoggedIn) {
    //         resetIdleTimer();
    //     } else {
    //         clearTimers();
    //     }

    //     return () => clearTimers();
    // }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) {
            clearTimers();
            return;
        }

        const handleActivity = () => {
            resetIdleTimer();
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, handleActivity));

        resetIdleTimer(); // Start timer on mount

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearTimers();
        };
    }, [isLoggedIn, resetIdleTimer]);

    return (
        <Dialog open={showModal} onClose={() => { }} disableEscapeKeyDown>
            <DialogTitle>Session Timeout Warning</DialogTitle>
            <DialogContent>
                You have been idle for a while. You will be logged out in <strong>{countdown}</strong> seconds.
            </DialogContent>
            <DialogActions>
                <Button onClick={logout} color="error" variant="outlined">Logout</Button>
                <Button
                    onClick={resetIdleTimer}
                    variant="contained"
                    color="primary"
                >
                    Stay Logged In
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IdleTimeoutHandler;
