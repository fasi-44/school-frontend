import React, { useEffect, useState } from "react";
import {
    TextField,
    Button,
    DialogContent,
    DialogActions,
    Grid,
    Alert
} from "@mui/material";
// import { toast } from 'react-toastify';
import customAxios from "../../../utils/axiosConfig";
import Loader from "../../../ui-component/Loader";
import { CLASSES_API_BASE_URL } from "../../../ApiConstants";

function ClassForm({ classData, loggedUser, onClose }) {
    const [formData, setFormData] = useState({
        class_name: "",
    });
    const [loading, setLoading] = useState(false);

    const isEditMode = Boolean(classData && classData.id);

    useEffect(() => {
        if (isEditMode && classData) {
            setFormData({
                class_name: classData.class_name || "",
            });
        } else {
            // Reset form for create mode
            setFormData({
                class_name: "",
            });
        }
    }, [classData, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                class_name: formData.class_name.trim()
            };

            let response;
            if (isEditMode) {
                response = await customAxios.put(CLASSES_API_BASE_URL + '/update/class/' + loggedUser?.skid + '/' + classData.id, payload);
            } else {
                response = await customAxios.post(CLASSES_API_BASE_URL + '/create/class/' + loggedUser?.skid, payload);
            }

            if (response.data.code === 200 && response.data.status === 'success') {
                // toast.success(response.data.message || `Class ${isEditMode ? 'updated' : 'created'} successfully`);
                onClose(true); // Pass true to indicate successful operation
            }
            // else {
            //     toast.error(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} class`);
            // }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} class:`, error);

            // Handle specific error cases
            if (error.response?.status === 400) {
                console.log(error.response)
                // toast.error(error.response.data.message || 'Invalid data provided');
            }
            // else if (error.response?.status === 409) {
            //     toast.error('Class name already exists');
            // } else {
            //     toast.error(`Error ${isEditMode ? 'updating' : 'creating'} class`);
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
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <TextField
                                fullWidth
                                label="Class Name"
                                name="class_name"
                                placeholder="e.g., Grade 1, 10th Standard"
                                value={formData.class_name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                    </Grid>
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
                        disabled={loading || !formData.class_name.trim()}
                    >
                        {isEditMode ? "Update Class" : "Create Class"}
                    </Button>
                </DialogActions>
            </form>
        </>
    );
}

export default ClassForm;