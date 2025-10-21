import React, { useEffect, useState } from "react";
import {
    TextField,
    Button,
    DialogContent,
    DialogActions,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Typography
} from "@mui/material";
// import { toast } from 'react-toastify';
import customAxios from "../../../utils/axiosConfig";
import Loader from "../../../ui-component/Loader";
import { CLASSES_API_BASE_URL, TEACHERS_API_BASE_URL, USERS_API_BASE_URL } from "../../../ApiConstants";

function SectionForm({ classData, sectionData, loggedUser, onClose }) {
    const [formData, setFormData] = useState({
        section_name: "",
        class_id: "",
        teacher_id: ""
    });
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);

    const isEditMode = Boolean(sectionData && sectionData.id);

    useEffect(() => {
        if (classData) {
            setFormData(prev => ({
                ...prev,
                class_id: classData.id
            }));
            fetchTeachers();
        }
    }, [classData]);

    useEffect(() => {
        if (isEditMode && sectionData) {
            setFormData({
                section_name: sectionData.section_name || "",
                class_id: classData?.id || sectionData.class_id || "",
                teacher_id: sectionData.teacher_id || ""
            });
        } else if (!isEditMode) {
            // Reset form for create mode
            setFormData({
                section_name: "",
                class_id: classData?.id || "",
                teacher_id: ""
            });
        }
    }, [sectionData, isEditMode, classData]);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(TEACHERS_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setTeachers(response.data.teachers || []);
            } else {
                // toast.error("Failed to fetch teachers");
                setTeachers([]);
            }
        } catch (error) {
            console.error("Error fetching teachers:", error);
            // toast.error("Error fetching teachers");
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const payload = {
                section_name: formData.section_name.trim(),
                class_id: formData.class_id,
                teacher_id: formData.teacher_id || null
            };

            let response;
            if (isEditMode) {
                response = await customAxios.put(CLASSES_API_BASE_URL + '/update/section/' + loggedUser?.skid + '/' + sectionData.id, payload);
            } else {
                response = await customAxios.post(CLASSES_API_BASE_URL + '/create/section/' + loggedUser?.skid, payload);
            }

            if (response.data.code === 200 && response.data.status === 'success') {
                // toast.success(response.data.message || `Section ${isEditMode ? 'updated' : 'created'} successfully`);
                onClose(true); // Pass true to indicate successful operation
            }
            // else {
            //     toast.error(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} section`);
            // }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} section:`, error);

            // Handle specific error cases
            if (error.response?.status === 400) {
                console.log(error.response)
                // toast.error(error.response.data.message || 'Invalid data provided');
            }
            // else if (error.response?.status === 409) {
            //     toast.error('Section name already exists for this class');
            // } else {
            //     toast.error(`Error ${isEditMode ? 'updating' : 'creating'} section`);
            // }
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
                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12 }}>
                            <Alert severity="info" sx={{ mt: 1 }}>
                                Creating section for: <strong>{classData?.class_name}</strong>
                            </Alert>
                        </Grid>
                    </Grid>
                    <br />
                    <Grid container spacing={3}>
                        <Grid item size={{ xl: 4, lg: 4, md: 4, sm: 6, xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Section Name"
                                name="section_name"
                                placeholder="e.g., A, B, Section 1, Alpha"
                                value={formData.section_name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                autoFocus={!isEditMode}
                            />
                        </Grid>

                        <Grid item size={{ xl: 8, lg: 8, md: 8, sm: 6, xs: 12 }}>
                            <FormControl fullWidth>
                                <InputLabel id="teacher-select-label">Class Teacher</InputLabel>
                                <Select
                                    labelId="teacher-select-label"
                                    label="Class Teacher"
                                    name="teacher_id"
                                    value={formData.teacher_id || ""}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">
                                        <em>No Teacher Assigned</em>
                                    </MenuItem>
                                    {teachers.map((teacher) => (
                                        <MenuItem key={teacher.id} value={teacher.id}>
                                            {teacher.name || `${teacher.first_name} ${teacher.last_name || ''}`.trim()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {teachers.length === 0 && !loading && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No teachers available. You can create the section without assigning a teacher and assign one later.
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                        onClick={handleCancel}
                        disabled={loading}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !formData.section_name.trim()}
                    >
                        {isEditMode ? "Update Section" : "Create Section"}
                    </Button>
                </DialogActions>
            </form>
        </>
    );
}

export default SectionForm;