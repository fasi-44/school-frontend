import React, { useState, useEffect } from 'react';
import {
    Box, Grid, TextField, Button, Card, CardContent, Typography,
    FormControl, InputLabel, Select, MenuItem, Chip, Stack,
    FormHelperText, Divider, Alert, IconButton, Paper,
    OutlinedInput
} from '@mui/material';
import {
    IconDeviceFloppy, IconArrowLeft, IconAlertCircle,
    IconCalendar, IconUpload, IconX
} from '@tabler/icons-react';
import MainCard from '../../../ui-component/cards/MainCard';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import customAxios from '../../../utils/axiosConfig';
import { CLASSES_API_BASE_URL, ANNOUNCEMENT_API_BASE_URL } from '../../../ApiConstants';
import { announcementTypes, inputStyles, labelStyles, priorities, targetAudiences } from '../../../AppConstants';
import HeaderCard from '../../../ui-component/cards/HeaderCard';
import MandatoryIndicator from '../components/MandatoryIndicator';

const CreateAnnouncement = () => {
    const navigate = useNavigate();
    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser,
        academicYear: state.globalState?.academicYear
    }));

    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);

    const [formData, setFormData] = useState({
        academic_year_id: academicYear?.id || '',
        title: '',
        description: '',
        announcement_type: 'General',
        priority: 'Normal',
        target_audience: 'ALL Users',  // Changed from 'All Users' to 'ALL'
        target_classes: [],
        target_sections: [],
        target_users: [],
        is_published: true,
        publish_date: dayjs(),
        expiry_date: null,
        attachments: []
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (academicYear?.id) {
            setFormData(prev => ({ ...prev, academic_year_id: academicYear.id }));
        }
    }, [academicYear]);

    // Fetch classes only when Specific Classes or Specific Sections is selected
    useEffect(() => {
        if (formData.target_audience === 'Specific Classes' || formData.target_audience === 'Specific Sections') {
            if (classes.length === 0) {
                fetchClasses();
            }
        } else {
            // Clear classes and sections when audience changes to something else
            setClasses([]);
            setSections([]);
            setFormData(prev => ({
                ...prev,
                target_classes: [],
                target_sections: []
            }));
        }
    }, [formData.target_audience]);

    // Fetch sections only when classes are selected for Specific Sections
    useEffect(() => {
        if (formData.target_audience === 'Specific Sections' && formData.target_classes.length > 0) {
            fetchSections(formData.target_classes);
        } else {
            setSections([]);
            setFormData(prev => ({ ...prev, target_sections: [] }));
        }
    }, [formData.target_classes, formData.target_audience]);

    const fetchClasses = async () => {
        try {
            setLoadingClasses(true);
            const response = await customAxios.get(CLASSES_API_BASE_URL + '/list/' + loggedUser?.skid);
            if (response.data.code === 200 && response.data.status === 'success') {
                setClasses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Failed to fetch classes');
        } finally {
            setLoadingClasses(false);
        }
    };

    const fetchSections = async (classIds) => {
        try {
            setLoadingSections(true);
            const allSections = [];
            for (const classId of classIds) {
                const response = await customAxios.get(CLASSES_API_BASE_URL + '/sections/' + loggedUser?.skid + '/' + classId);
                if (response.data.code === 200) {
                    allSections.push(...(response.data.data || []));
                }
            }
            setSections(allSections);
        } catch (error) {
            console.error('Error fetching sections:', error);
            toast.error('Failed to fetch sections');
        } finally {
            setLoadingSections(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleMultiSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.announcement_type) newErrors.announcement_type = 'Announcement type is required';
        if (!formData.target_audience) newErrors.target_audience = 'Target audience is required';

        if (formData.target_audience === 'Specific Classes' && formData.target_classes.length === 0) {
            newErrors.target_classes = 'Please select at least one class';
        }

        if (formData.target_audience === 'Specific Sections' && formData.target_sections.length === 0) {
            newErrors.target_sections = 'Please select at least one section';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ...formData,
                publish_date: formData.publish_date ? formData.publish_date.toISOString() : null,
                expiry_date: formData.expiry_date ? formData.expiry_date.toISOString() : null,
                created_by: loggedUser?.school_user_id  // Use school_user_id
            };

            const response = await customAxios.post(
                `${ANNOUNCEMENT_API_BASE_URL}/create/${loggedUser?.skid}`,
                payload
            );

            if (response.data.code === 201) {
                toast.success('Announcement created successfully!');
                navigate('/announcements/list');
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            toast.error(error.response?.data?.message || 'Failed to create announcement');
        } finally {
            setLoading(false);
        }
    };

    const breadcrumbLinks = [
        { title: 'Dashboard', to: '/dashboard' },
        { title: 'Announcements', to: '/announcements/list' },
        { title: 'Create Announcements', to: '/announcements/create' },
    ];

    return (
        <Box>
            {/* Header */}
            <HeaderCard
                heading={"Create Announcement"}
                breadcrumbLinks={breadcrumbLinks}
                buttonColor={'primary'}
                buttonvariant={'variant'}
                // buttonText=" Create Announcement"
                onButtonClick={() => navigate(-1)}
                buttonIcon={<IconArrowLeft color='white' />}
            />

            <MainCard>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Info Alert */}
                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12, }}>
                            <Alert severity="info" icon={<IconAlertCircle />}>
                                Send announcements to students, teachers, and parents
                            </Alert>
                        </Grid>
                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="title" sx={labelStyles}>
                                    <MandatoryIndicator label="Announcement Title" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={inputStyles}
                                    placeholder="Enter announcement title"
                                    error={!!errors.title}
                                    helperText={errors.title}
                                />
                            </Stack>
                        </Grid>
                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="description" sx={labelStyles}>
                                    <MandatoryIndicator label="Description" isRequired={true} />
                                </InputLabel>
                                <OutlinedInput
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    multiline
                                    rows={6}
                                    sx={inputStyles}
                                    placeholder="Enter detailed description"
                                    error={!!errors.description}
                                    helperText={errors.description}
                                />
                            </Stack>
                        </Grid>

                        {/* Announcement Type */}
                        <Grid item size={{ xl: 3, lg: 3, md: 4, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="announcement_type" sx={labelStyles}>
                                    <MandatoryIndicator label="Announcement Type" isRequired={true} />
                                </InputLabel>
                                <Select
                                    name="announcement_type"
                                    value={formData.announcement_type}
                                    onChange={handleChange}
                                >
                                    {announcementTypes.map(type => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.announcement_type && (
                                    <FormHelperText>{errors.announcement_type}</FormHelperText>
                                )}
                            </Stack>
                        </Grid>

                        {/* Priority */}
                        <Grid item size={{ xl: 3, lg: 3, md: 4, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="priority" sx={labelStyles}>
                                    <MandatoryIndicator label="Priority" isRequired={true} />
                                </InputLabel>
                                <Select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    {priorities.map(priority => (
                                        <MenuItem key={priority.value} value={priority.value}>
                                            {priority.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Stack>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 4, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="publish_date" sx={labelStyles}>
                                    <MandatoryIndicator label="Publishing Date" isRequired={true} />
                                </InputLabel>
                                <DatePicker
                                    size='large'
                                    value={formData.publish_date}
                                    onChange={(date) => setFormData(prev => ({ ...prev, publish_date: date }))}
                                />
                            </Stack>
                        </Grid>
                        <Grid item size={{ xl: 3, lg: 3, md: 4, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="expiry_date" sx={labelStyles}>
                                    <MandatoryIndicator label="Expiry or Event Date" isRequired={true} />
                                </InputLabel>
                                <DatePicker
                                    size='large'
                                    value={formData.expiry_date}
                                    onChange={(date) => setFormData(prev => ({ ...prev, expiry_date: date }))}
                                    minDate={formData.publish_date}
                                />
                            </Stack>
                        </Grid>

                        {/* Info Alert */}
                        <Grid item size={{ xl: 12, lg: 12, md: 12, sm: 12, xs: 12, }}>
                            <Alert severity="info" icon={<IconAlertCircle />}>
                                Target Audience - Recipients will be notified immediately after publishing, based on the publishing date
                            </Alert>
                        </Grid>

                        <Grid item size={{ xl: 3, lg: 3, md: 4, sm: 12, xs: 12, }}>
                            <Stack spacing={1}>
                                <InputLabel htmlFor="target_audience" sx={labelStyles}>
                                    <MandatoryIndicator label="Send To" isRequired={true} />
                                </InputLabel>
                                <Select
                                    name="target_audience"
                                    value={formData.target_audience}
                                    onChange={handleChange}
                                >
                                    {targetAudiences.map(audience => (
                                        <MenuItem key={audience.value} value={audience.value}>
                                            {audience.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.target_audience && (
                                    <FormHelperText>{errors.target_audience}</FormHelperText>
                                )}
                            </Stack>
                        </Grid>

                        {/* Class Selection - Only show when Specific Classes is selected */}
                        {formData.target_audience === 'Specific Classes' && (
                            <Grid item size={{ xl: 3, lg: 3, md: 4, sm: 12, xs: 12, }}>
                                <Stack spacing={1}>
                                    <InputLabel htmlFor="target_classes" sx={labelStyles}>
                                        <MandatoryIndicator label="Select Classes" isRequired={true} />
                                    </InputLabel>
                                    <Select
                                        multiple
                                        value={formData.target_classes}
                                        onChange={(e) => handleMultiSelectChange('target_classes', e.target.value)}
                                        disabled={loadingClasses}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => {
                                                    const cls = classes.find(c => c.id === value);
                                                    return (
                                                        <Chip
                                                            key={value}
                                                            label={cls?.class_name}
                                                            size="small"
                                                        />
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    >
                                        {loadingClasses ? (
                                            <MenuItem disabled>Loading classes...</MenuItem>
                                        ) : (
                                            classes.map((cls) => (
                                                <MenuItem key={cls.id} value={cls.id}>
                                                    {cls.class_name}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                    {errors.target_classes && (
                                        <FormHelperText>{errors.target_classes}</FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                        )}

                        {/* Section Selection - Only show when Specific Sections is selected */}
                        {formData.target_audience === 'Specific Sections' && (
                            <>
                                <Grid item size={{ xl: 3, lg: 3, md: 4, sm: 12, xs: 12, }}>
                                    <Stack spacing={1}>
                                        <InputLabel htmlFor="target_classes" sx={labelStyles}>
                                            <MandatoryIndicator label="Select Classes First" isRequired={true} />
                                        </InputLabel>
                                        <Select
                                            multiple
                                            value={formData.target_classes}
                                            onChange={(e) => handleMultiSelectChange('target_classes', e.target.value)}
                                            disabled={loadingClasses}
                                        >
                                            {loadingClasses ? (
                                                <MenuItem disabled>Loading classes...</MenuItem>
                                            ) : (
                                                classes.map((cls) => (
                                                    <MenuItem key={cls.id} value={cls.id}>
                                                        {cls.class_name}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </Stack>
                                </Grid>

                                {formData.target_classes.length > 0 && (
                                    <Grid item size={{ xl: 3, lg: 3, md: 4, sm: 12, xs: 12, }}>
                                        <Stack spacing={1}>
                                            <InputLabel htmlFor="target_sections" sx={labelStyles}>
                                                <MandatoryIndicator label="Select Sections" isRequired={true} />
                                            </InputLabel>
                                            <Select
                                                multiple
                                                value={formData.target_sections}
                                                onChange={(e) => handleMultiSelectChange('target_sections', e.target.value)}
                                                disabled={loadingSections}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => {
                                                            const section = sections.find(s => s.id === value);
                                                            return (
                                                                <Chip
                                                                    key={value}
                                                                    label={section?.section_name}
                                                                    size="small"
                                                                />
                                                            );
                                                        })}
                                                    </Box>
                                                )}
                                            >
                                                {loadingSections ? (
                                                    <MenuItem disabled>Loading sections...</MenuItem>
                                                ) : (
                                                    sections.map((section) => (
                                                        <MenuItem key={section.id} value={section.id}>
                                                            {section.section_name} ({section.teacher_name})
                                                        </MenuItem>
                                                    ))
                                                )}
                                            </Select>
                                            {errors.target_sections && (
                                                <FormHelperText>{errors.target_sections}</FormHelperText>
                                            )}
                                        </Stack>
                                    </Grid>
                                )}
                            </>
                        )}
                    </Grid>
                    <br />
                    <Grid container spacing={2} mt={4} justifyContent="flex-end">
                        {/* Action Buttons */}
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                type="submit"
                                color="primary"
                                size="small"
                                startIcon={<IconDeviceFloppy />}
                                disabled={loading}
                            >
                                {loading ? 'Publishing...' : 'Publish Announcement'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </MainCard>
        </Box>
    );
};

export default CreateAnnouncement;
