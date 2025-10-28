import {
    Button, InputLabel, OutlinedInput,
    Grid, Stack, useTheme, Fade
} from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MainCard from "../../../ui-component/cards/MainCard";
import customAxios from "../../../utils/axiosConfig";
import { TEACHERS_API_BASE_URL } from "../../../ApiConstants";
import Loader from "../../../ui-component/Loader";
import MandatoryIndicator from "../components/MandatoryIndicator";
import { toast } from "react-toastify";
import HeaderCard from "../../../ui-component/cards/HeaderCard";
import { IconArrowLeft } from "@tabler/icons-react";


export default function TeacherCreateOrUpdate() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const mode = location.state?.mode || 'create';
    const teacherData = location.state?.user || {};
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [formData, setFormData] = useState({
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        username: null,
        date_of_birth: null,
        address: null,
        hire_date: dayjs().format("YYYY-MM-DD"),
        status: "active",
        designation: null,
        qualifications: null,
        salary: null,
        role_id: 3, //TEACHER
        role: "TEACHER",
        skid: loggedUser?.skid || null,
        school_id: loggedUser?.school_id || null,
        password: "Admin@123",
        employee_id: null
    });

    useEffect(() => {
        if (mode === "update" && teacherData) {
            const { created_at, updated_at, ...restData } = teacherData;
            setFormData({
                ...restData,
                date_of_birth: teacherData.date_of_birth ? dayjs(teacherData.date_of_birth).format("YYYY-MM-DD") : "",
                designation: teacherData.profile.designation,
                qualifications: teacherData.profile.qualifications,
                salary: teacherData.profile.salary,
            });
        }
    }, [teacherData]);

    const labelStyles = {
        fontWeight: 500,
        fontSize: '0.95rem',
        color: 'text.primary'
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let resp;
            if (mode === 'update') {
                resp = await customAxios.put(TEACHERS_API_BASE_URL + '/update/' + loggedUser?.skid + '/' + formData.id, formData);
            } else {
                resp = await customAxios.post(TEACHERS_API_BASE_URL + '/create/' + loggedUser?.skid, formData);
            }
            console.log(resp);
            if (resp.data.code === 409 && resp.data.status === 'error') {
                toast.error(resp.data.message || "School with this code already exists.");
            } else if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || (mode === 'update' ? "Teacher updated successfully!" : "Teacher created successfully!"));
                navigate('/teacher/list');
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

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Teacher List', to: '/teacher/list' },
        {
            title: (mode === 'update' ? "Update Teacher" : "Create Teacher"),
            to: (mode === 'update' ? '/teacher/update' : '/teacher/create')
        },
    ];

    return (
        <>
            <Loader loading={loading} />
            <HeaderCard
                heading={mode === 'update' ? "Update Teacher" : "Create Teacher"}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
                onButtonClick={() => navigate(-1)}
                buttonIcon={<IconArrowLeft color='white' />}
            />
            <MainCard title={mode === 'update' ? "Update Teacher" : "Create Teacher"} >
                <form onSubmit={handleSubmit}>
                    <Grid container rowSpacing={3} columnSpacing={2}>
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="first_name" sx={labelStyles}>
                                    <MandatoryIndicator label="First Name" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="last_name" sx={labelStyles}>
                                    <MandatoryIndicator label="Last Name" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="email" sx={labelStyles}>
                                    <MandatoryIndicator label="Email" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="phone" sx={labelStyles}>
                                    <MandatoryIndicator label="Phone" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="phone"
                                    name="phone"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="date_of_birth" sx={labelStyles}>
                                    Date of Birth
                                </InputLabel>
                                <OutlinedInput
                                    id="date_of_birth"
                                    name="date_of_birth"
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="hire_date" sx={labelStyles}>
                                    Hire Date
                                </InputLabel>
                                <OutlinedInput
                                    id="hire_date"
                                    name="hire_date"
                                    type="date"
                                    value={formData.hire_date}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="address" sx={labelStyles}>
                                    Address
                                </InputLabel>
                                <OutlinedInput
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="employee_id" sx={labelStyles}>
                                    <MandatoryIndicator label="Employee Id" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="employee_id"
                                    name="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleChange}
                                    placeholder="Enter Employee Id"
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="designation" sx={labelStyles}>
                                    Designation
                                </InputLabel>
                                <OutlinedInput
                                    id="designation"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="Enter designation"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="qualifications" sx={labelStyles}>
                                    Qualification
                                </InputLabel>
                                <OutlinedInput
                                    id="qualifications"
                                    name="qualifications"
                                    value={formData.qualifications}
                                    onChange={handleChange}
                                    placeholder="Enter qualification"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="salary" sx={labelStyles}>
                                    Salary
                                </InputLabel>
                                <OutlinedInput
                                    id="salary"
                                    name="salary"
                                    type="number"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    placeholder="Enter salary"
                                    fullWidth
                                    inputProps={{ step: "0.01" }}
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Username */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="username" sx={labelStyles}>Username</InputLabel>
                                <OutlinedInput
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* password */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="password" sx={labelStyles}>Password</InputLabel>
                                <OutlinedInput
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} mt={4} justifyContent="flex-end">
                        <Grid item>
                            <Button variant="outlined" color="error" size="small" onClick={() => navigate('/teacher/list')}>
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" type="submit" color="primary" size="small" disabled={loading}>
                                {mode === 'update' ? "Update Teacher" : "Create Teacher"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </MainCard>
        </>
    );
}
