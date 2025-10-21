// ProtectedRoute.js
import { Navigate } from "react-router-dom";
import AccessDenied from "./AccessDenied";
import { useSelector } from "react-redux";
import { checkUserHasRoleAndPermission } from "../SharedService";

const ProtectedRoute = ({ children, requiredPermission }) => {
    // Get the session token from the Redux store (or wherever you store it)
    // const { authToken, loggedUser } = getReduxState(); // Get authHeader from Redux
    const { authToken, loggedUser } = useSelector((state) => state.globalState || {});

    // If the token is null, redirect to sign-in page
    if (!authToken) {
        return <Navigate to="/" replace />;
    }

    if (!requiredPermission) {
        return children;
    }

    if (!checkUserHasRoleAndPermission(loggedUser?.role, requiredPermission)) {
        return <AccessDenied /> || (
            <div>
                <h1>Access Denied</h1>
                <p>You do not have the required permission</p>
            </div>
        );
    }
    // Otherwise, render the children (protected component)
    return children;
};

export default ProtectedRoute;
