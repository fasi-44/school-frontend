import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from './store/slices/authSlice';

import { RouterProvider } from 'react-router-dom';
import router from 'routes'; // ✅ Use your existing router instance

import NavigationScroll from 'layout/NavigationScroll';
import ThemeCustomization from 'themes';
import { FullscreenProvider } from './contexts/FullScreenContext';
import IdleTimeoutHandler from './views/pages/components/IdleTimeoutHandler';
import Toaster from './views/pages/components/Toaster';

export default function App() {
    const dispatch = useDispatch();
    const { authToken, loggedUser } = useSelector((state) => state.globalState || {});

    const handleLogout = async () => {
        console.log(authToken, loggedUser)
        if (!authToken || !loggedUser?.id) return;

        try {
            await dispatch(logoutUser()).unwrap();
            router.navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <ThemeCustomization>
            <FullscreenProvider>
                <NavigationScroll>
                    {authToken && (
                        <IdleTimeoutHandler
                            isLoggedIn={!!authToken}
                            idleTime={900}
                            onLogout={handleLogout}
                        />
                    )}
                    <Toaster position='bottom-center' duration={5000} />
                    <RouterProvider router={router} />
                </NavigationScroll>
            </FullscreenProvider>
        </ThemeCustomization>
    );
}
