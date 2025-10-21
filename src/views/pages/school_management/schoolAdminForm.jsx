import React, { useEffect, useState } from "react";
import {
    TextField, Button, DialogContent, DialogActions, Grid
} from "@mui/material";
import customAxios from "../../../utils/axiosConfig";
import Loader from "../../../ui-component/Loader";
import { USERS_API_BASE_URL } from "../../../ApiConstants";


function SchoolAdminForm({ school, onClose }) {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        school_id: "",
        role: "SCHOOL_ADMIN"
    });
    const [loading, setLoading] = useState(false);
    const isEditMode = Boolean(school && school.school_admin_id);


    useEffect(() => {
        if (isEditMode) {
            getSchoolAdmin();
        }
    }, [])

    const getSchoolAdmin = async () => {
        // school_admin_id is the ID of the school admin present in the school object,
        // so we fetch the admin details using that ID.
        try {
            setLoading(true);
            const resp = await customAxios.get(USERS_API_BASE_URL + '/schoolAdmin/' + school.skid + '/' + school.school_admin_id);
            if (resp.data.code === 200 && resp.data.status === 'success') {
                setFormData(resp.data.user);
            }
        } catch (error) {
            toast.error("Error fetching school admin.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission for creating or updating the school admin
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = { ...formData, school_id: school.id, skid: school.skid };

            let resp;
            if (isEditMode) {
                resp = await customAxios.put(USERS_API_BASE_URL + '/update/' + school.school_admin_id, payload);
            } else {
                resp = await customAxios.post(USERS_API_BASE_URL + '/create', payload);
            }

            if (resp.data.code === 200 && resp.data.status === 'success') {
                toast.success(resp.data.message);
            } else {
                toast.error(resp.data.message);
            }
        } catch (error) {
            toast.error(isEditMode ? "Error updating school admin." : "Error creating school admin.");
            console.error(error);
        } finally {
            onClose();
            setLoading(false);
        }
    };


    return (
        <>
            <Loader loading={loading} />
            <DialogContent dividers>
                <Grid container rowSpacing={4} columnSpacing={3}>
                    <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12, }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required />
                    </Grid>

                    <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12, }}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required />
                    </Grid>

                    <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12, }}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required />
                    </Grid>

                    <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12, }}>
                        <TextField
                            fullWidth
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required />
                    </Grid>

                    <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12, }}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required />
                    </Grid>
                    {!isEditMode && (
                        <Grid item size={{ xl: 6, lg: 6, md: 6, sm: 6, xs: 12, }}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!isEditMode}
                                disabled={isEditMode} />
                        </Grid>)}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}> {isEditMode ? "Update School Admin" : "Create School Admin"}</Button>
            </DialogActions>
        </>
    );
}

export default SchoolAdminForm;
