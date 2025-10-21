import React, { useEffect, useState } from "react";
import {
    TextField,
    Button,
    DialogContent,
    DialogActions,
    Grid,
    Alert,
    Autocomplete,
} from "@mui/material";
import customAxios from "../../../utils/axiosConfig";
import Loader from "../../../ui-component/Loader";
import { SUBJECTS_API_BASE_URL, TEACHERS_API_BASE_URL } from "../../../ApiConstants";
import { toast } from 'react-toastify';

function SubjectForm({ classData, subjectData, loggedUser, onClose }) {
    const [formData, setFormData] = useState({
        subject_name: "",
        subject_code: "",
        grade_level: "",
        teacher_ids: []
    });
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const isEditMode = Boolean(subjectData && subjectData.id);

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (isEditMode && subjectData) {
            // Extract teacher IDs from the teachers array
            const teacherIds = subjectData.teachers?.map(t => t.id) || [];

            setFormData({
                subject_name: subjectData.subject_name || "",
                subject_code: subjectData.subject_code || "",
                grade_level: subjectData.grade_level || "",
                teacher_ids: teacherIds
            });
        } else {
            // Reset form for create mode
            setFormData({
                subject_name: "",
                subject_code: "",
                grade_level: "",
                teacher_ids: []
            });
        }
    }, [subjectData, isEditMode]);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${TEACHERS_API_BASE_URL}/list/${loggedUser?.skid}`
            );
            if (response.data.code === 200 && response.data.status === 'success') {
                setTeachers(response.data.teachers || []);
            } else {
                toast.error("Failed to fetch teachers");
                setTeachers([]);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
            toast.error("Error fetching teachers");
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.subject_name.trim()) {
            toast.error("Subject name is required");
            return;
        }
        if (!formData.subject_code.trim()) {
            toast.error("Subject code is required");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                subject_name: formData.subject_name.trim(),
                subject_code: formData.subject_code.trim(),
                grade_level: classData.class_name,
                class_id: classData.id,
                teacher_ids: formData.teacher_ids
            };

            let response;
            if (isEditMode) {
                response = await customAxios.put(
                    `${SUBJECTS_API_BASE_URL}/update/subject/${loggedUser?.skid}/${subjectData.id}`,
                    payload
                );
            } else {
                response = await customAxios.post(
                    `${SUBJECTS_API_BASE_URL}/create/subject/${loggedUser?.skid}`,
                    payload
                );
            }

            if (response.data.code === 200 && response.data.status === 'success') {
                toast.success(
                    response.data.message ||
                    `Subject ${isEditMode ? 'updated' : 'created'} successfully`
                );
                onClose(true); // Pass true to indicate successful operation
            } else {
                toast.error(
                    response.data.message ||
                    `Failed to ${isEditMode ? 'update' : 'create'} subject`
                );
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} subject:`, error);

            // Handle specific error cases
            if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Invalid data provided');
            } else if (error.response?.status === 409) {
                toast.error('Subject code already exists');
            } else {
                toast.error(`Error ${isEditMode ? 'updating' : 'creating'} subject`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose(false); // Pass false to indicate operation was cancelled
    };

    return (
        <>
            <Loader loading={loading} />
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        {classData && (
                            <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12 }}>
                                <Alert severity="info" sx={{ mt: 1 }}>
                                    This subject will be {isEditMode ? 'updated' : 'created'} for{' '}
                                    <strong>{classData.class_name}</strong>
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                    <br />
                    <Grid container spacing={3}>
                        <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Subject Name"
                                name="subject_name"
                                placeholder="e.g., Mathematics, English Literature"
                                value={formData.subject_name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Subject Code"
                                name="subject_code"
                                placeholder="e.g., MATH101, ENG201"
                                value={formData.subject_code}
                                onChange={handleChange}
                                required
                                helperText="Unique identifier for the subject"
                            />
                        </Grid>

                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12 }}>
                            <Autocomplete
                                multiple
                                options={teachers}
                                getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                                value={teachers.filter((t) => formData.teacher_ids.includes(t.id))}
                                onChange={(e, value) => {
                                    setFormData({
                                        ...formData,
                                        teacher_ids: value.map((t) => t.id)
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Assign Teachers"
                                        placeholder="Select teachers"
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                        onClick={handleCancel}
                        disabled={loading}
                        variant="outlined"
                        color="error"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !formData.subject_name.trim() || !formData.subject_code.trim()}
                    >
                        {isEditMode ? "Update Subject" : "Create Subject"}
                    </Button>
                </DialogActions>
            </form>
        </>
    );
}

export default SubjectForm;
