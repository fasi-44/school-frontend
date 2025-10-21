import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useFormik } from 'formik';
import { toast } from "react-toastify";

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { loginUser, clearError } from "../../../store/slices/authSlice";

import { useDispatch, useSelector } from "react-redux";
import Loader from '../../../ui-component/Loader';
// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    // const [checked, setChecked] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { error } = useSelector(
        (state) => state.globalState
    );

    useEffect(() => {
        if (error) {
            console.log(error)
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleFormSubmit = async (values, { setSubmitting }) => {
        try {
            setLoading(true);
            const response = await dispatch(
                loginUser({
                    identifier: values.identifier,
                    password: values.password,
                })
            ).unwrap();
            if (response && response.access_token) {
                navigate("/dashboard");
                toast.success(response.message || "Login successful!");
            } else {
                // Handle case where login response doesn't have access_token
                toast.error(response?.message || "Login failed. Please try again.");
                console.error("Login response invalid:", response);
            }
        } catch (error) {
            console.error("Login failed:", error);
            if (error?.message) {
                toast.error(error.message);
            } else if (typeof error === 'string') {
                toast.error(error);
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            identifier: "",
            password: "",
        },
        onSubmit: handleFormSubmit,
    });

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <>
            <Loader loading={loading} />
            <form onSubmit={formik.handleSubmit}>
                <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
                    <InputLabel htmlFor="outlined-adornment-email-login">Email Address / Username</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-email-login"
                        type="email"
                        {...formik.getFieldProps('identifier')}
                        name="identifier"
                    />
                </FormControl>

                <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
                    <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
                    <OutlinedInput
                        id="outlined-adornment-password-login"
                        type={showPassword ? 'text' : 'password'}
                        {...formik.getFieldProps('password')}
                        name="password"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    size="large"
                                >
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Password"
                    />
                </FormControl>

                <Box sx={{ mt: 2 }}>
                    <AnimateButton>
                        <Button
                            color="secondary"
                            fullWidth
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={formik.isSubmitting}
                        >
                            Sign In
                        </Button>
                    </AnimateButton>
                </Box>
            </form>
        </>
    );
}
