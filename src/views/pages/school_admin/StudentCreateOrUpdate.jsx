import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Button, Grid, Stack, InputLabel, OutlinedInput, Fade, useTheme,
    Select,
    MenuItem,
    FormControl
} from "@mui/material";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import MainCard from "../../../ui-component/cards/MainCard";
import customAxios from "../../../utils/axiosConfig";
import { CLASSES_API_BASE_URL, STUDENTS_API_BASE_URL, USERS_API_BASE_URL } from "../../../ApiConstants";
import Loader from "../../../ui-component/Loader";

export default function StudentCreateOrUpdate() {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'create';
    const studentData = location.state?.user || {};
    const [loading, setLoading] = useState(false);
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [sections, setSections] = useState({});

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        username: "",
        date_of_birth: "",
        gender: "",
        address: "",
        admission_date: dayjs().format("YYYY-MM-DD"),
        status: "active",
        parent_name: "",
        parent_phone: "",
        parent_email: "",
        student_id: "",
        role_id: 4,
        role: "STUDENT",
        skid: loggedUser?.skid || "",
        school_id: loggedUser?.school_id || "",
        class_id: null,
        section_id: null,
        password: "Admin@123"
    });

    // Load initial data
    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
        }
    }, [selectedClass]);

    useEffect(() => {
        console.log(studentData, mode, classes)
        if (mode === "update" && studentData) {
            const { created_at, updated_at, ...restData } = studentData;
            setFormData({
                ...restData,
                date_of_birth: studentData.date_of_birth ? dayjs(studentData.date_of_birth).format("YYYY-MM-DD") : "",
                admission_date: studentData.admission_date ? dayjs(studentData.admission_date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                class_id: studentData?.profile?.class_id || null,
                section_id: studentData?.profile?.section_id || null
            });

            // Set selected class if class_id exists in student data
            if (studentData?.profile?.class_id) {
                setSelectedClass(studentData.profile.class_id);
            }
        }
    }, [studentData, mode, classes]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If user is selecting a class (class_id), update selectedClass and fetch sections
        if (name === 'class_id') {
            setSelectedClass(value);
            setFormData(prev => ({
                ...prev,
                class_id: value,
                section_id: ''
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };


    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            // toast.error('Error fetching classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async (classId) => {
        try {
            setLoading(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/sections/' + loggedUser?.skid + '/' + classId);
            if (response.data.code === 200 && response.data.status === 'success') {
                setSections(prev => ({
                    ...prev,
                    [classId]: response.data.data || []
                }));
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
            // toast.error('Error fetching sections');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let resp;
            if (mode === 'update') {
                resp = await customAxios.put(STUDENTS_API_BASE_URL + '/update/' + formData.id, formData);
            } else {
                resp = await customAxios.post(STUDENTS_API_BASE_URL + '/create/' + loggedUser?.skid, formData);
            }
            if (resp.data.code === 409 && resp.data.status === 'error') {
                toast.error(resp.data.message || "Student already exists.");
            } else if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message || (mode === 'update' ? "Student updated successfully!" : "Student created successfully!"));
                navigate('/users/list');
            } else {
                toast.error(resp.data.message);
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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

    // Get current sections for selected class
    const currentSections = selectedClass ? sections[selectedClass] || [] : [];

    return (
        <>
            <Loader loading={loading} />
            <MainCard title={mode === 'update' ? "Update Student" : "Create Student"}>
                <form onSubmit={handleSubmit}>
                    <Grid container rowSpacing={3} columnSpacing={2}>
                        {/* First Name */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="first_name" sx={labelStyles}>First Name *</InputLabel>
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

                        {/* Last Name */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="last_name" sx={labelStyles}>Last Name *</InputLabel>
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

                        {/* Email */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="email" sx={labelStyles}>Email *</InputLabel>
                                <OutlinedInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Phone */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="phone" sx={labelStyles}>Phone *</InputLabel>
                                <OutlinedInput
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Gender */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="gender" sx={labelStyles}>Gender *</InputLabel>
                                <FormControl fullWidth>
                                    <Select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        displayEmpty
                                        required
                                        sx={inputStyles}
                                    >
                                        <MenuItem value=""><em>Select Gender</em></MenuItem>
                                        <MenuItem value="Male">Male</MenuItem>
                                        <MenuItem value="Female">Female</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
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
                                <InputLabel htmlFor="admission_date" sx={labelStyles}>
                                    Admission Date
                                </InputLabel>
                                <OutlinedInput
                                    id="admission_date"
                                    name="admission_date"
                                    type="date"
                                    value={formData.admission_date}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Grade Level - Class Selection */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="class_id" sx={labelStyles}>Grade Level *</InputLabel>
                                <FormControl fullWidth>
                                    <Select
                                        id="class_id"
                                        name="class_id"
                                        value={formData.class_id}
                                        onChange={handleChange}
                                        displayEmpty
                                        required
                                        sx={inputStyles}
                                    >
                                        <MenuItem value="">
                                            <em>Select Class</em>
                                        </MenuItem>
                                        {classes.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>
                                                {cls.class_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Grid>

                        {/* Grade Section - Sections for Selected Class */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="section_id" sx={labelStyles}>Section *</InputLabel>
                                <FormControl fullWidth>
                                    <Select
                                        id="section_id"
                                        name="section_id"
                                        value={formData.section_id}
                                        onChange={handleChange}
                                        displayEmpty
                                        required
                                        disabled={!selectedClass || currentSections.length === 0}
                                        sx={inputStyles}
                                    >
                                        <MenuItem value="">
                                            <em>
                                                {!selectedClass
                                                    ? "Select Class first"
                                                    : currentSections.length === 0
                                                        ? "No sections available"
                                                        : "Select Section"}
                                            </em>
                                        </MenuItem>
                                        {currentSections.map((section) => (
                                            <MenuItem key={section.id} value={section.id}>
                                                {section.section_name}
                                                {section.teacher_name && ` - ${section.teacher_name}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Grid>

                        {/* Roll no. */}
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="student_id" sx={labelStyles}>Roll no.</InputLabel>
                                <OutlinedInput
                                    id="student_id"
                                    name="student_id"
                                    value={formData.student_id}
                                    onChange={handleChange}
                                    placeholder="Enter roll no."
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>

                        {/* Address */}
                        <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="address" sx={labelStyles}>Address</InputLabel>
                                <OutlinedInput
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                    fullWidth
                                    minRows={3}
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
                        {mode != "update" &&
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
                        }
                    </Grid>

                    <Grid container spacing={2} mt={4} justifyContent="flex-end">
                        {mode === 'update' && (
                            <Grid item>
                                <Button variant="outlined" color="error" onClick={() => navigate('/school/users/list')}>
                                    Cancel
                                </Button>
                            </Grid>
                        )}
                        <Grid item>
                            <Button variant="contained" type="submit" color="primary" disabled={loading}>
                                {mode === 'update' ? "Update Student" : "Create Student"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </MainCard>
        </>
    );
}