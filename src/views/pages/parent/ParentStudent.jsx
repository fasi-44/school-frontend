import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, Grid, Button, Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import customAxios from '../../../utils/axiosConfig';
import Loader from '../../../ui-component/Loader';
import MainCard from '../../../ui-component/cards/MainCard';
import { TEACHERS_API_BASE_URL, SUBJECTS_API_BASE_URL } from '../../../ApiConstants';

const ParentStudent = () => {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classes, setClasses] = useState({});
    const [sections, setSections] = useState({});

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
        }
    }, [selectedClass]);

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
    const currentSections = selectedClass ? sections[selectedClass] || [] : [];

    return (
        <>
            <Loader loading={loading} />
            <MainCard title="Assign Subjects to Teacher">

                {/* Class */}
                <Grid item size={{ xl: 3, lg: 3, md: 6, sm: 12, xs: 12 }}>
                    <Stack spacing={1}>
                        <InputLabel htmlFor="class_id" sx={labelStyles}>
                            Grade Level *
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
                            Section *
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
            </MainCard>
        </>
    );
};

export default ParentStudent;
