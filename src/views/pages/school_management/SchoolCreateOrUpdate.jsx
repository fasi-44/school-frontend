import { useEffect } from "react";
import Grid from '@mui/material/Grid';

import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    InputLabel,
    Fade,
    useTheme,
    Stack,
    OutlinedInput
} from "@mui/material";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SchoolIcon from '@mui/icons-material/School';
import customAxios from "../../../utils/axiosConfig";
import MainCard from "../../../ui-component/cards/MainCard";
import Loader from "../../../ui-component/Loader";
import { SCHOOL_API_BASE_URL } from "../../../ApiConstants";

const plans = ["BASIC", "STANDARD", "PREMIUM"];

export default function SchoolCreateOrUpdate() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const schoolData = location.state?.school || {};
    const mode = location.state?.mode || 'create';
    const [loading, setLoading] = useState(false);
    const authState = useSelector((state) => state.globalState);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        city: "",
        state: "",
        country: "",
        phone: "",
        email: "",
        website: "",
        plan: "BASIC",
    });

    useEffect(() => {
        if (mode === 'update') {
            setFormData(schoolData)
        }
    }, [mode, schoolData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let resp;
            if (mode === 'update') {
                resp = await customAxios.put(SCHOOL_API_BASE_URL + '/update/' + formData.id, formData);
            } else {
                resp = await customAxios.post(SCHOOL_API_BASE_URL + '/create', formData);
            }
            console.log(resp)
            if (resp.data.code === 409 && resp.data.status === 'error') {
                toast.error(resp.data.message || "School with this code already exists.");
            } else if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || (mode === 'update' ? "School updated successfully!" : "School created successfully!"));
                navigate('/school/list');
            } else {
                toast.error(resp.data.message)
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyles = {
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        '&.Mui-focused': {
            boxShadow: `0 4px 20px ${theme.palette.primary.main}20`,
        }
    };

    const labelStyles = {
        fontSize: '1rem',
        fontWeight: 500,
        color: theme.palette.text.primary,
        textTransform: 'capitalize'
    };

    return (
        <>
            <Loader loading={loading} />
            <Fade in timeout={600}>
                <MainCard
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <SchoolIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                            <Typography variant="h3" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                {mode === 'update' ? 'Update School' : 'Create New School'}
                            </Typography>
                        </Box>
                    }
                    sx={{
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        borderRadius: 2,
                        background: theme.palette.background.paper,
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* School Name */}
                            <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="name" sx={labelStyles}>
                                        School Name *
                                    </InputLabel>
                                    <OutlinedInput
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter school name"
                                        required
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>

                            {/* School Code */}
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="code" sx={labelStyles}>
                                        School Code *
                                    </InputLabel>
                                    <OutlinedInput
                                        id="code"
                                        name="code"
                                        type="text"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="Enter unique school code"
                                        required
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>

                            {/* Phone */}
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="phone" sx={labelStyles}>
                                        Phone Number
                                    </InputLabel>
                                    <OutlinedInput
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="XXXXXXXXXX"
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>

                            {/* Email */}
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="email" sx={labelStyles}>
                                        Email Address
                                    </InputLabel>
                                    <OutlinedInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="school@example.com"
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>

                            {/* Website */}
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="website" sx={labelStyles}>
                                        Website
                                    </InputLabel>
                                    <OutlinedInput
                                        id="website"
                                        name="website"
                                        type="text"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://www.schoolwebsite.com"
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>

                            {/* Plan - Using TextField for select dropdown */}
                            <Grid item size={{ xl: 2, lg: 2, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="plan" sx={labelStyles}>
                                        Subscription Plan
                                    </InputLabel>
                                    <TextField
                                        id="plan"
                                        name="plan"
                                        select
                                        value={formData.plan}
                                        onChange={handleChange}
                                        variant="outlined"
                                        sx={{
                                            '& .MuiOutlinedInput-root': inputStyles
                                        }}
                                    >
                                        {plans.map((plan) => (
                                            <MenuItem key={plan} value={plan}>
                                                {plan}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>
                            </Grid>

                            {/* Address */}
                            <Grid item size={{ xl: 4, lg: 4, md: 6, sm: 12, xs: 12 }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="address" sx={labelStyles}>
                                        Street Address
                                    </InputLabel>
                                    <OutlinedInput
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter complete address"
                                        rows={2}
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>

                            {/* City */}
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="city" sx={labelStyles}>
                                        City
                                    </InputLabel>
                                    <OutlinedInput
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>

                            {/* State */}
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="state" sx={labelStyles}>
                                        State/Province
                                    </InputLabel>
                                    <OutlinedInput
                                        id="state"
                                        name="state"
                                        type="text"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>

                            {/* Country */}
                            <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="country" sx={labelStyles}>
                                        Country
                                    </InputLabel>
                                    <OutlinedInput
                                        id="country"
                                        name="country"
                                        type="text"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Enter country"
                                        sx={inputStyles}
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                        <Grid container columnSpacing={3} style={{ marginTop: '20px' }} justifyContent="flex-end" alignItems="center">
                            {mode === 'update' && (
                                <Grid item xs={12}>
                                    <Button variant="outlined" color="error" onClick={() => navigate('/school/list')}>
                                        Cancel
                                    </Button>
                                </Grid>)}
                            <Grid item xs={12}>
                                <Button variant="contained" type="submit" color="primary">
                                    {mode === 'update' ? "Update School" : "Create School"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </MainCard>
            </Fade>
        </>
    );
}