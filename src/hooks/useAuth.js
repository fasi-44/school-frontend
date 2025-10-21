// app/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { loginUser, logoutUser, clearError, updateLocation } from '../store/slices/authSlice';

const useAuth = () => {
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.globalState);

    const login = async (credentials) => {
        return dispatch(loginUser(credentials)).unwrap();
    };

    const logout = async () => {
        return dispatch(logoutUser()).unwrap();
    };

    const clearAuthError = () => {
        dispatch(clearError());
    };

    const setLocation = (location) => {
        dispatch(updateLocation(location));
    };

    return {
        // Spread all auth state properties
        ...authState,
        // Custom methods
        login,
        logout,
        clearError: clearAuthError,
        setLocation,
    };
};

export default useAuth;