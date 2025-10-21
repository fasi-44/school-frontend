// components/students/ParentSection.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Autocomplete, TextField, IconButton,
    Paper, Chip, Stack, Grid, Collapse, Divider
} from '@mui/material';
import { IconPlus, IconX, IconUserPlus, IconEdit, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import customAxios from '../../../utils/axiosConfig';
import { PARENTS_API_BASE_URL } from '../../../ApiConstants';
import { toast } from 'react-toastify';
import ParentCreate from '../parent/ParentCreate';

const ParentSection = ({ skid, onParentChange, initialParent = null }) => {
    const [parentMode, setParentMode] = useState('new');
    const [existingParents, setExistingParents] = useState([]);
    const [selectedParent, setSelectedParent] = useState(initialParent);
    const [openNewParentDialog, setOpenNewParentDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expandedDetails, setExpandedDetails] = useState(false);

    useEffect(() => {
        setSelectedParent(initialParent);
    }, [initialParent])

    useEffect(() => {
        if (parentMode === 'existing') {
            fetchExistingParents();
        }
    }, [parentMode]);

    useEffect(() => {
        // Notify parent component - pass the selected parent with its relation_type
        onParentChange(selectedParent);
    }, [selectedParent]);

    const fetchExistingParents = async () => {
        try {
            setLoading(true);
            const response = await customAxios.get(`${PARENTS_API_BASE_URL}/list/${skid}`);
            if (response.data.code === 200) {
                setExistingParents(response.data.parents || []);
            }
        } catch (error) {
            console.error('Error fetching parents:', error);
            toast.error('Failed to fetch parents');
        } finally {
            setLoading(false);
        }
    };

    const handleParentCreated = (parentData) => {
        const newParent = {
            id: parentData.school_user_id,
            father_full_name: parentData.father_full_name,
            mother_full_name: parentData.mother_full_name,
            father_phone: parentData.father_phone,
            mother_phone: parentData.mother_phone,
            email: parentData.email,
            phone: parentData.phone,
            address: parentData.address,
            city: parentData.city,
            state: parentData.state,
            postal_code: parentData.postal_code,
            father_occupation: parentData.father_occupation,
            father_qualification: parentData.father_qualification,
            mother_occupation: parentData.mother_occupation,
            mother_qualification: parentData.mother_qualification,
            relation_type: parentData.relation_type, // ✅ From ParentCreate form
            isNew: true
        };

        setSelectedParent(newParent);
        setOpenNewParentDialog(false);
        toast.success('Parent added successfully!');
    };

    const handleSelectExistingParent = (event, value) => {
        if (value) {
            // For existing parents, we need to set a default relation_type
            // since it's not stored in the parent list API response
            setSelectedParent({
                ...value,
                relation_type: 'Father'
            });
        }
    };

    const handleRemoveParent = () => {
        setSelectedParent(null);
        setExpandedDetails(false);
    };

    // Custom filter function for Autocomplete
    const filterOptions = (options, { inputValue }) => {
        const searchTerm = inputValue.toLowerCase();
        return options.filter(option => {
            const fatherName = (option.father_full_name || '').toLowerCase();
            const motherName = (option.mother_full_name || '').toLowerCase();
            const fatherPhone = (option.father_phone || '').toLowerCase();
            const motherPhone = (option.mother_phone || '').toLowerCase();

            return (
                fatherName.includes(searchTerm) ||
                motherName.includes(searchTerm) ||
                fatherPhone.includes(searchTerm) ||
                motherPhone.includes(searchTerm)
            );
        });
    };
    console.log("selectedParent:", selectedParent)
    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Parent/Guardian Information</Typography>

            {/* Mode Selection - Only show if no parent selected */}
            {!selectedParent && (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Button
                        variant={parentMode === 'new' ? 'contained' : 'outlined'}
                        onClick={() => { setParentMode('new'); setOpenNewParentDialog(true) }}
                        startIcon={<IconUserPlus size={18} />}
                        size="small"
                    >
                        Create New Parent
                    </Button>
                    <Button
                        variant={parentMode === 'existing' ? 'contained' : 'outlined'}
                        onClick={() => setParentMode('existing')}
                        startIcon={<IconEdit size={18} />}
                        size="small"
                    >
                        Link Existing Parent
                    </Button>
                </Stack>
            )}

            {/* Link Existing Parent Mode - Single Search */}
            {!selectedParent && parentMode === 'existing' && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Search Parent/Guardian
                    </Typography>
                    <Autocomplete
                        options={existingParents}
                        filterOptions={filterOptions}
                        getOptionLabel={(option) => {
                            const parts = [];
                            if (option.father_full_name) parts.push(`Father: ${option.father_full_name}`);
                            if (option.mother_full_name) parts.push(`Mother: ${option.mother_full_name}`);
                            if (option.father_phone) parts.push(`📞 ${option.father_phone}`);
                            if (option.mother_phone && option.mother_phone !== option.father_phone) {
                                parts.push(`📞 ${option.mother_phone}`);
                            }
                            return parts.join(' | ') || 'Unknown Parent';
                        }}
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {option.father_full_name && `Father: ${option.father_full_name}`}
                                        {option.father_full_name && option.mother_full_name && ' | '}
                                        {option.mother_full_name && `Mother: ${option.mother_full_name}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        📞 {option.father_phone || option.mother_phone || 'No phone'}
                                    </Typography>
                                    {option.address && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            📍 {option.address}, {option.city}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}
                        onChange={handleSelectExistingParent}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search by father name, mother name, or phone number..."
                                size="small"
                            />
                        )}
                        value={null}
                        loading={loading}
                        noOptionsText="No parents found"
                    />
                </Box>
            )}

            {/* Selected Parent Display */}
            {selectedParent && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Selected Parent/Guardian
                    </Typography>
                    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                        {/* Header */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2,
                                bgcolor: 'primary.lighter'
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight={600}>
                                    {selectedParent.father_full_name && `Father: ${selectedParent.father_full_name}`}
                                    {selectedParent.father_full_name && selectedParent.mother_full_name && ' | '}
                                    {selectedParent.mother_full_name && `Mother: ${selectedParent.mother_full_name}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    📞 {selectedParent.father_phone || selectedParent.mother_phone || selectedParent.phone}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                {selectedParent.isNew && (
                                    <Chip label="New" size="small" color="success" />
                                )}
                                <Chip
                                    label={selectedParent.relation_type || 'Parent'}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => setExpandedDetails(!expandedDetails)}
                                >
                                    {expandedDetails ?
                                        <IconChevronUp size={18} /> :
                                        <IconChevronDown size={18} />
                                    }
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={handleRemoveParent}
                                    sx={{ color: 'error.main' }}
                                >
                                    <IconX size={18} />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Expanded Details */}
                        <Collapse in={expandedDetails}>
                            <Divider />
                            <Box sx={{ p: 2 }}>
                                <Grid container spacing={2}>
                                    {/* Father Details */}
                                    {selectedParent.father_full_name && (
                                        <>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="primary" fontWeight={600}>
                                                    Father's Details
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Full Name</Typography>
                                                <Typography variant="body2">{selectedParent.father_full_name}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Phone</Typography>
                                                <Typography variant="body2">{selectedParent.father_phone || 'N/A'}</Typography>
                                            </Grid>
                                            {selectedParent.father_occupation && (
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Occupation</Typography>
                                                    <Typography variant="body2">{selectedParent.father_occupation}</Typography>
                                                </Grid>
                                            )}
                                            {selectedParent.father_qualification && (
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Qualification</Typography>
                                                    <Typography variant="body2">{selectedParent.father_qualification}</Typography>
                                                </Grid>
                                            )}
                                        </>
                                    )}

                                    {/* Mother Details */}
                                    {selectedParent.mother_full_name && (
                                        <>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>
                                                    Mother's Details
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Full Name</Typography>
                                                <Typography variant="body2">{selectedParent.mother_full_name}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Phone</Typography>
                                                <Typography variant="body2">{selectedParent.mother_phone || 'N/A'}</Typography>
                                            </Grid>
                                            {selectedParent.mother_occupation && (
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Occupation</Typography>
                                                    <Typography variant="body2">{selectedParent.mother_occupation}</Typography>
                                                </Grid>
                                            )}
                                            {selectedParent.mother_qualification && (
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="caption" color="text.secondary">Qualification</Typography>
                                                    <Typography variant="body2">{selectedParent.mother_qualification}</Typography>
                                                </Grid>
                                            )}
                                        </>
                                    )}

                                    {/* Address */}
                                    {selectedParent.address && (
                                        <>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>
                                                    Address
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body2">
                                                    {selectedParent.address}
                                                    {selectedParent.city && `, ${selectedParent.city}`}
                                                    {selectedParent.state && `, ${selectedParent.state}`}
                                                    {selectedParent.postal_code && ` - ${selectedParent.postal_code}`}
                                                </Typography>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </Box>
                        </Collapse>
                    </Paper>
                </Box>
            )}

            {/* Reuse ParentCreate as Dialog */}
            {openNewParentDialog && (
                <ParentCreate
                    isDialog={true}
                    skid={skid}
                    onClose={() => setOpenNewParentDialog(false)}
                    onSuccess={handleParentCreated}
                />
            )}
        </Box>
    );
};

export default ParentSection;
