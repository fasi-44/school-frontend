import React, { useState, useEffect } from "react";
import {
    Button, Grid, Stack, InputLabel, OutlinedInput, useTheme,
    Select, MenuItem, FormControl, Alert, Box,
    Divider
} from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import customAxios from "../../../utils/axiosConfig";
import { CLASSES_API_BASE_URL, PARENTS_API_BASE_URL, STUDENT_PARENT_API_BASE_URL, STUDENTS_API_BASE_URL } from "../../../ApiConstants";
import Loader from "../../../ui-component/Loader";
import { labelStyles } from "../../../AppConstants";
import MandatoryIndicator from "../components/MandatoryIndicator";
import { useParams } from "react-router";
import ParentSection from "./ParentSection";

export default function SingleStudentCreate({ mode = 'create', studentData = {}, navigate }) {
    const theme = useTheme();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [sections, setSections] = useState({});
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        first_name: null,
        last_name: null,
        email: null,
        phone: null,
        username: null,
        date_of_birth: null,
        gender: null,
        address: null,
        admission_date: dayjs().format("YYYY-MM-DD"),
        status: "active",
        parent_name: null,
        parent_phone: null,
        parent_email: null,
        roll_no: null,
        role_id: 4,
        role: "STUDENT",
        skid: loggedUser?.skid || null,
        school_id: loggedUser?.school_id || null,
        class_id: null,
        section_id: null,
        password: "Admin@123"
    });
    const [selectedParent, setSelectedParent] = useState(null);
    const [initialParent, setInitialParent] = useState(null);

    // Load initial data
    useEffect(() => {
        if (params?.studentId) {
            fetchStudentById(params.studentId);
        }
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
        }
    }, [selectedClass]);

    const validateForm = () => {
        const newErrors = {};

        // Required field validation
        const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'gender', 'class_id', 'section_id'];
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Phone validation
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

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

    // Helper function to extract flat student fields from nested student data
    const extractStudentFormData = (studentData) => {
        return {
            // User fields
            id: studentData.id,
            first_name: studentData.first_name ?? null,
            last_name: studentData.last_name ?? null,
            email: studentData.email ?? null,
            phone: studentData.phone ?? null,
            username: studentData.username ?? null,
            gender: studentData.gender ?? null,
            address: studentData.address ?? null,
            city: studentData.city ?? null ?? null,
            state: studentData.state ?? null,
            postal_code: studentData.postal_code ?? null,

            // Dates
            date_of_birth: studentData.date_of_birth
                ? dayjs(studentData.date_of_birth).format("YYYY-MM-DD")
                : null,
            admission_date: studentData.profile?.admission_date
                ? dayjs(studentData.profile.admission_date).format("YYYY-MM-DD")
                : dayjs().format("YYYY-MM-DD"),

            // Student profile fields
            roll_no: studentData.profile?.roll_no ?? null,
            class_id: studentData.profile?.class_id ?? null,
            section_id: studentData.profile?.section_id ?? null,
            blood_group: studentData.profile?.blood_group ?? null,

            // Fixed fields
            role_id: 4,
            role: "STUDENT",
            skid: loggedUser?.skid ?? null,
            school_id: loggedUser?.school_id ?? null,
            status: studentData.status ?? "active",
        };
    };

    const fetchStudentById = async (id) => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${STUDENTS_API_BASE_URL}/get-by-id/${loggedUser?.skid}/${id}`
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                let studentData = response.data.student || {};

                // Set initial parent
                if (studentData?.parent) {
                    setInitialParent(studentData.parent);
                    setSelectedParent(studentData.parent);
                }

                // Extract only flat fields
                setFormData(extractStudentFormData(studentData));

                // Set selected class
                if (studentData?.profile?.class_id) {
                    setSelectedClass(studentData.profile.class_id);
                }
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            toast.error('Error fetching student');
        } finally {
            setLoading(false);
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
            toast.error('Error fetching classes');
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
            toast.error('Error fetching sections');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fill in all required fields correctly');
            return;
        }

        try {
            setLoading(true);
            let resp;
            if (mode === 'update') {
                const payload = { ...formData };
                delete payload.full_name;
                delete payload.role;
                delete payload.school_id;
                delete payload.skid;
                delete payload.password;
                resp = await customAxios.put(STUDENTS_API_BASE_URL + '/update/' + loggedUser?.skid + '/' + formData.id, payload);

                if (resp.data.code === 200 && resp.data.status === 'success') {
                    // Check if parent has changed and update parent link accordingly
                    const parentChanged = selectedParent?.id !== initialParent?.id;
                    console.log(parentChanged)
                    if (parentChanged) {
                        try {
                            await customAxios.put(
                                `${STUDENT_PARENT_API_BASE_URL}/update/${loggedUser?.skid}/${formData.id}`,
                                {
                                    parent_user_id: selectedParent?.id || null,
                                    relation_type: selectedParent?.relation_type || 'Guardian'
                                }
                            );
                        } catch (linkError) {
                            console.error('Error updating parent link:', linkError);
                            toast.warning('Student updated but failed to update parent link');
                        }
                    }
                    toast.success('Student updated successfully!');
                    navigate('/student/list');
                }
            } else {
                resp = await customAxios.post(STUDENTS_API_BASE_URL + '/create/' + loggedUser?.skid, formData);

                if (resp.data.code === 200 && resp.data.status === 'success') {
                    const studentUserId = resp.data.student.school_user_id;
                    // Link parent if selected
                    if (selectedParent) {
                        try {
                            await customAxios.post(
                                `${STUDENT_PARENT_API_BASE_URL}/assign/${loggedUser?.skid}`,
                                {
                                    parent_user_id: selectedParent.id,
                                    relation_type: selectedParent.relation_type || 'Father',
                                    student_user_ids: [studentUserId],
                                }
                            );
                        } catch (linkError) {
                            console.error('Error linking parent:', linkError);
                            toast.warning('Student created but failed to link parent');
                        }
                    }
                    toast.success(
                        `Student created successfully${selectedParent ? ' with parent linked' : ''}!`
                    );
                    navigate('/student/list');
                }
            }
        } catch (error) {
            console.error("Submission error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
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

    const currentSections = selectedClass ? sections[selectedClass] || [] : [];

    return (
        <>
            <Loader loading={loading} />

            {mode === 'create' && (
                <Alert
                    severity="info"
                    sx={{ mt: -3, mb: 3, borderRadius: 2 }}
                >
                    Please fill in all required fields marked with (*) to create a new student account.
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={3} columnSpacing={2}>
                    {/* First Name */}
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
                                error={!!errors.first_name}
                                sx={inputStyles}
                            />
                            {errors.first_name && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                    {errors.first_name}
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Last Name */}
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
                                error={!!errors.last_name}
                                sx={inputStyles}
                            />
                            {errors.last_name && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                    {errors.last_name}
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Email */}
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
                                required
                                error={!!errors.email}
                                sx={inputStyles}
                            />
                            {errors.email && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                    {errors.email}
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Phone */}
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel htmlFor="phone" sx={labelStyles}>
                                <MandatoryIndicator label="Phone" isRequired={true} />
                            </InputLabel>
                            <OutlinedInput
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                fullWidth
                                required
                                error={!!errors.phone}
                                sx={inputStyles}
                            />
                            {errors.phone && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                    {errors.phone}
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Gender */}
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel htmlFor="gender" sx={labelStyles}>
                                <MandatoryIndicator label="Gender" isRequired={true} />
                            </InputLabel>
                            <FormControl fullWidth error={!!errors.gender}>
                                <Select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    displayEmpty
                                    required
                                    sx={inputStyles}
                                >
                                    <MenuItem value="">
                                        <em>Select Gender</em>
                                    </MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                            {errors.gender && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                    {errors.gender}
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Date of Birth */}
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
                                sx={inputStyles}
                            />
                        </Stack>
                    </Grid>

                    {/* Admission Date */}
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

                    {/* Class */}
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel htmlFor="class_id" sx={labelStyles}>
                                <MandatoryIndicator label="Grade Level" isRequired={true} />
                            </InputLabel>
                            <FormControl fullWidth error={!!errors.class_id}>
                                <Select
                                    id="class_id"
                                    name="class_id"
                                    value={formData.class_id || ''}
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
                            {errors.class_id && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                    {errors.class_id}
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Section */}
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel htmlFor="section_id" sx={labelStyles}>
                                <MandatoryIndicator label="Section" isRequired={true} />
                            </InputLabel>
                            <FormControl fullWidth error={!!errors.section_id}>
                                <Select
                                    id="section_id"
                                    name="section_id"
                                    value={formData.section_id || ''}
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
                            {errors.section_id && (
                                <Box sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                    {errors.section_id}
                                </Box>
                            )}
                        </Stack>
                    </Grid>

                    {/* Roll Number */}
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                        <Stack spacing={1}>
                            <InputLabel htmlFor="roll_no" sx={labelStyles}>
                                Roll Number
                            </InputLabel>
                            <OutlinedInput
                                id="roll_no"
                                name="roll_no"
                                value={formData.roll_no}
                                onChange={handleChange}
                                placeholder="Enter roll number"
                                fullWidth
                                sx={inputStyles}
                            />
                        </Stack>
                    </Grid>

                    {/* Address */}
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
                                // multiline
                                // rows={3}
                                sx={inputStyles}
                            />
                        </Stack>
                    </Grid>

                    {/* Username */}
                    <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                        <Stack spacing={1}>
                            <InputLabel htmlFor="username" sx={labelStyles}>
                                Username
                            </InputLabel>
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

                    {/* Password - Only for create mode */}
                    {mode !== "update" && (
                        <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="password" sx={labelStyles}>
                                    Password
                                </InputLabel>
                                <OutlinedInput
                                    id="password"
                                    name="password"
                                    // type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    fullWidth
                                    sx={inputStyles}
                                />
                            </Stack>
                        </Grid>
                    )}
                </Grid>

                <br />
                <Divider />

                <ParentSection
                    skid={loggedUser?.skid}
                    onParentChange={setSelectedParent}
                    initialParent={mode === 'update' ? initialParent : null}
                />

                {/* Action Buttons */}
                <Box sx={{
                    mt: 4,
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    pt: 2,
                    borderTop: 1,
                    borderColor: 'divider'
                }}>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => navigate(-1)}
                        sx={{ px: 3 }}
                        size='small'
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        disabled={loading}
                        sx={{ px: 3 }}
                        size='small'
                    >
                        {mode === 'update' ? "Update Student" : "Create Student"}
                    </Button>
                </Box>
            </form>
        </>
    );
}