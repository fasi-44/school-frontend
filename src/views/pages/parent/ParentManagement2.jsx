// ParentManagement.jsx
import React from "react";
import {
    Button, Grid, Stack, InputLabel, OutlinedInput, Select,
    MenuItem, FormControl, Alert, Box, Typography, Card,
    CardContent, IconButton, Chip, Divider
} from "@mui/material";
import { Add, Delete, Person } from "@mui/icons-material";

const ParentManagement = ({
    mode = 'none', // 'none', 'create', 'link'
    availableParents = [],
    newParents = [],
    selectedParents = [],
    onModeChange = () => { },
    onAddParent = () => { },
    onRemoveParent = () => { },
    onUpdateParent = () => { },
    onParentSelection = () => { },
    onRemoveSelectedParent = () => { },
    errors = {}
}) => {
    const getEmptyParent = () => ({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        occupation: "",
        education_level: "",
        relation_type: "Guardian"
    });

    const handleAddParent = () => {
        onAddParent([...newParents, getEmptyParent()]);
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                Parent/Guardian Information
            </Typography>

            {/* Parent Management Mode Selection */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Button
                        variant={mode === 'none' ? 'contained' : 'outlined'}
                        onClick={() => onModeChange('none')}
                        size="small"
                    >
                        Skip for Now
                    </Button>
                    <Button
                        variant={mode === 'create' ? 'contained' : 'outlined'}
                        onClick={() => onModeChange('create')}
                        startIcon={<Add />}
                        size="small"
                    >
                        Create New Parents
                    </Button>
                    <Button
                        variant={mode === 'link' ? 'contained' : 'outlined'}
                        onClick={() => onModeChange('link')}
                        startIcon={<Person />}
                        size="small"
                    >
                        Link Existing Parents
                    </Button>
                </Stack>
            </Box>

            {/* Create New Parents */}
            {mode === 'create' && (
                <Box>
                    {newParents.map((parent, index) => (
                        <Card key={index} sx={{ mb: 2, bgcolor: 'grey.50' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Parent/Guardian {index + 1}
                                    </Typography>
                                    {newParents.length > 1 && (
                                        <IconButton
                                            onClick={() => onRemoveParent(index)}
                                            color="error"
                                            size="small"
                                        >
                                            <Delete />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <InputLabel sx={{ fontWeight: 500 }}>First Name *</InputLabel>
                                        <OutlinedInput
                                            value={parent.first_name}
                                            onChange={(e) => onUpdateParent(index, 'first_name', e.target.value)}
                                            placeholder="Enter first name"
                                            fullWidth
                                            size="small"
                                            error={!!errors[`parent_${index}_name`]}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <InputLabel sx={{ fontWeight: 500 }}>Last Name *</InputLabel>
                                        <OutlinedInput
                                            value={parent.last_name}
                                            onChange={(e) => onUpdateParent(index, 'last_name', e.target.value)}
                                            placeholder="Enter last name"
                                            fullWidth
                                            size="small"
                                            error={!!errors[`parent_${index}_name`]}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <InputLabel sx={{ fontWeight: 500 }}>Email</InputLabel>
                                        <OutlinedInput
                                            type="email"
                                            value={parent.email}
                                            onChange={(e) => onUpdateParent(index, 'email', e.target.value)}
                                            placeholder="Enter email"
                                            fullWidth
                                            size="small"
                                            error={!!errors[`parent_${index}_email`]}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <InputLabel sx={{ fontWeight: 500 }}>Phone</InputLabel>
                                        <OutlinedInput
                                            value={parent.phone}
                                            onChange={(e) => onUpdateParent(index, 'phone', e.target.value)}
                                            placeholder="Enter phone"
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <InputLabel sx={{ fontWeight: 500 }}>Relationship</InputLabel>
                                        <Select
                                            value={parent.relation_type}
                                            onChange={(e) => onUpdateParent(index, 'relation_type', e.target.value)}
                                            fullWidth
                                            size="small"
                                        >
                                            <MenuItem value="Father">Father</MenuItem>
                                            <MenuItem value="Mother">Mother</MenuItem>
                                            <MenuItem value="Guardian">Guardian</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <InputLabel sx={{ fontWeight: 500 }}>Occupation</InputLabel>
                                        <OutlinedInput
                                            value={parent.occupation}
                                            onChange={(e) => onUpdateParent(index, 'occupation', e.target.value)}
                                            placeholder="Enter occupation"
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <InputLabel sx={{ fontWeight: 500 }}>Education Level</InputLabel>
                                        <OutlinedInput
                                            value={parent.education_level}
                                            onChange={(e) => onUpdateParent(index, 'education_level', e.target.value)}
                                            placeholder="Enter education level"
                                            fullWidth
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={handleAddParent}
                        sx={{ mt: 2 }}
                        size="small"
                    >
                        Add Another Parent/Guardian
                    </Button>
                </Box>
            )}

            {/* Link Existing Parents */}
            {mode === 'link' && (
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select existing parents from the system and define their relationship to this student.
                    </Typography>

                    {availableParents.length === 0 ? (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            No existing parents found in the system. You can create new parents instead.
                        </Alert>
                    ) : (
                        <Box>
                            {availableParents.map((parent) => {
                                const isSelected = selectedParents.some(p => p.parentId === parent.id);
                                const selectedParent = selectedParents.find(p => p.parentId === parent.id);

                                return (
                                    <Card key={parent.id} sx={{ mb: 2, bgcolor: isSelected ? 'primary.50' : 'grey.50' }}>
                                        <CardContent>
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={12} sm={4}>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {parent.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {parent.email}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {parent.phone}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} sm={4}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Relationship</InputLabel>
                                                        <Select
                                                            value={selectedParent?.relationshipType || ''}
                                                            onChange={(e) => onParentSelection(parent.id, e.target.value)}
                                                            label="Relationship"
                                                        >
                                                            <MenuItem value="Father">Father</MenuItem>
                                                            <MenuItem value="Mother">Mother</MenuItem>
                                                            <MenuItem value="Guardian">Guardian</MenuItem>
                                                            <MenuItem value="Other">Other</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>

                                                <Grid item xs={12} sm={4}>
                                                    {isSelected ? (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => onRemoveSelectedParent(parent.id)}
                                                            size="small"
                                                            startIcon={<Delete />}
                                                        >
                                                            Remove
                                                        </Button>
                                                    ) : (
                                                        <Chip
                                                            label={parent.occupation || 'No occupation listed'}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    )}

                    {selectedParents.length > 0 && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            {selectedParents.length} parent(s) selected for this student.
                        </Alert>
                    )}
                </Box>
            )}

            {mode === 'none' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Parent information will be skipped. You can add parent relationships later from the student management section.
                </Alert>
            )}
        </Box>
    );
};

export default ParentManagement;