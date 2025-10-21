import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
    Button, Autocomplete, TextField, Avatar, List, ListItem, ListItemAvatar,
    ListItemSecondaryAction, IconButton, Paper, Divider
} from '@mui/material';
import { IconUsers, IconX, IconPlus } from '@tabler/icons-react';
import { useTheme } from '@mui/material';
import customAxios from '../../../utils/axiosConfig';
import { STUDENTS_API_BASE_URL, CLASSES_API_BASE_URL } from '../../../ApiConstants';
import { toast } from 'react-toastify';

function AddStudentsToSections({
    open,
    onClose,
    sectionId,
    sectionName,
    classId,
    skid,
    currentStudentIds = [],
    onStudentsAdded
}) {
    const theme = useTheme();
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch available students when modal opens
    useEffect(() => {
        if (open) {
            fetchAvailableStudents();
        } else {
            // Reset state when modal closes
            setSelectedStudents([]);
        }
    }, [open]);

    const fetchAvailableStudents = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(
                `${STUDENTS_API_BASE_URL}/list/${skid}`
            );
            if (response.data.code === 200) {
                const allStudents = response.data.students || [];
                // Filter out students already in the section
                const available = allStudents.filter(
                    s => !currentStudentIds.includes(s.id)
                );
                setAvailableStudents(available);
            }
        } catch (error) {
            console.error('Error fetching available students:', error);
            toast.error('Failed to fetch available students');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromSelected = (studentId) => {
        setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
    };

    const handleAddStudents = async () => {
        if (selectedStudents.length === 0) {
            toast.warning('Please select at least one student');
            return;
        }

        try {
            setLoading(true);
            const studentIds = selectedStudents.map(s => s.id);

            const response = await customAxios.post(
                `${CLASSES_API_BASE_URL}/add-to-section/${skid}/${sectionId}`,
                { student_ids: studentIds }
            );

            if (response.data.code === 200 && response.data.status === 'success') {
                toast.success(response.data.message || 'Students added successfully');
                onStudentsAdded(); // Callback to refresh parent list
                onClose();
            } else {
                toast.error(response.data.message || 'Failed to add students');
            }
        } catch (error) {
            console.error('Error adding students:', error);
            toast.error('Failed to add students to section');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconUsers size={24} />
                    <Typography variant="h5">
                        Add Students to {sectionName}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <IconX />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Select Students
                    </Typography>
                    <Autocomplete
                        options={availableStudents}
                        getOptionLabel={(option) => option.full_name || ''}
                        loading={loading}
                        renderOption={(props, option) => (
                            <Box
                                component="li"
                                {...props}
                                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                            >
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {option.full_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {option.email}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                        onChange={(event, value) => {
                            if (value && !selectedStudents.find(s => s.id === value.id)) {
                                setSelectedStudents([...selectedStudents, value]);
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search and select students..."
                                variant="outlined"
                            />
                        )}
                        value={null}
                        disabled={loading}
                    />
                </Box>

                {/* Selected Students List */}
                {selectedStudents.length > 0 ? (
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Selected Students ({selectedStudents.length})
                        </Typography>
                        <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                            <List>
                                {selectedStudents.map((student, index) => (
                                    <React.Fragment key={student.id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main', color: '#fff' }}>
                                                    {student.full_name?.[0]?.toUpperCase()}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {student.full_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {student.email}
                                                </Typography>
                                            </Box>
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => handleRemoveFromSelected(student.id)}
                                                    sx={{ color: 'error.main' }}
                                                >
                                                    <IconX size={18} />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < selectedStudents.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <IconUsers size={48} stroke={1.5} color={theme.palette.text.disabled} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No students selected yet. Search and select students from the dropdown above.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color='primary'
                    onClick={handleAddStudents}
                    disabled={selectedStudents.length === 0 || loading}
                    startIcon={<IconPlus size={18} />}
                >
                    Add {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''} Students
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default React.memo(AddStudentsToSections);
