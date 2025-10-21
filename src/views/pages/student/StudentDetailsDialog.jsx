// components/students/StudentDetailsDialog.jsx
import React, { useState } from 'react';
import {
    Dialog, DialogContent, Box, Typography, Button,
    Grid, Avatar, Chip, IconButton, Tabs, Tab, Card, CardContent, Stack, Divider
} from '@mui/material';
import {
    IconX, IconMail, IconPhone, IconCalendar, IconMapPin, IconUser,
    IconSchool, IconUsers, IconId
} from '@tabler/icons-react';

const StudentDetailsDialog = ({ open, onClose, student, onEdit }) => {
    const [activeTab, setActiveTab] = useState(0);

    if (!student) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const InfoRow = ({ icon, label, value }) => (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
            <Box sx={{
                mt: 0.5,
                color: 'primary.main',
                display: 'flex',
                minWidth: 24
            }}>
                {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ display: 'block', mb: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight="500">
                    {value || 'N/A'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: 'hidden'
                }
            }}
        >
            {/* Compact Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                position: 'relative'
            }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                        zIndex: 1
                    }}
                >
                    <IconX size={20} />
                </IconButton>

                <Box sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                width: 70,
                                height: 70,
                                bgcolor: 'white',
                                color: 'primary.main',
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                border: '3px solid rgba(255,255,255,0.3)'
                            }}
                        >
                            {student.first_name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" fontWeight="700" gutterBottom>
                                {student.full_name}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                <Chip
                                    label={student.profile?.student_id || 'No ID'}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 500,
                                        height: 24
                                    }}
                                />
                                <Chip
                                    label={student.is_active ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{
                                        bgcolor: student.is_active ? '#4caf50' : '#757575',
                                        color: 'white',
                                        fontWeight: 500,
                                        height: 24
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Box>
                </Box>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                        px: 2,
                        '& .MuiTab-root': {
                            color: 'rgba(255,255,255,0.7)',
                            fontWeight: 600,
                            textTransform: 'none',
                            minHeight: 48,
                            '&.Mui-selected': {
                                color: 'white'
                            }
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: 'white',
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        }
                    }}
                >
                    <Tab label="Personal Info" />
                    <Tab label="Academic" />
                    {student.parent && <Tab label="Parent / Guardian" />}
                </Tabs>
            </Box>

            {/* Content */}
            <DialogContent sx={{ p: 0, bgcolor: '#f5f7fa' }}>
                {/* Tab 0: Personal Information */}
                {activeTab === 0 && (
                    <Box sx={{ p: 3 }}>
                        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={<IconUser size={20} />}
                                            label="Username"
                                            value={student.username}
                                        />
                                        <Divider />
                                        <InfoRow
                                            icon={<IconMail size={20} />}
                                            label="Email Address"
                                            value={student.email}
                                        />
                                        <Divider />
                                        <InfoRow
                                            icon={<IconPhone size={20} />}
                                            label="Phone Number"
                                            value={student.phone}
                                        />
                                        <Divider />
                                        <InfoRow
                                            icon={<IconCalendar size={20} />}
                                            label="Date of Birth"
                                            value={formatDate(student.date_of_birth)}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={<IconId size={20} />}
                                            label="Student ID"
                                            value={student.profile?.student_id}
                                        />
                                        <Divider />
                                        <InfoRow
                                            icon={<IconCalendar size={20} />}
                                            label="Admission Date"
                                            value={formatDate(student.profile?.admission_date)}
                                        />
                                        <Divider />
                                        <InfoRow
                                            icon={<IconUser size={20} />}
                                            label="Gender"
                                            value={student.gender}
                                        />
                                        {student.address && (
                                            <>
                                                <Divider />
                                                <InfoRow
                                                    icon={<IconMapPin size={20} />}
                                                    label="Address"
                                                    value={student.address}
                                                />
                                            </>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Tab 1: Academic Information */}
                {activeTab === 1 && (
                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Card sx={{
                                    borderRadius: 3,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    background: 'linear-gradient(135deg, #667eea15 0%, #667eea05 100%)',
                                    border: '1px solid #667eea30'
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1.5rem'
                                            }}>
                                                <IconSchool size={28} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    Class / Grade
                                                </Typography>
                                                <Typography variant="h5" fontWeight="700" color="primary" sx={{ mt: 0.5 }}>
                                                    {student.class?.class_name || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Card sx={{
                                    borderRadius: 3,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c05 100%)',
                                    border: '1px solid #f093fb30'
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1.5rem'
                                            }}>
                                                <IconUsers size={28} />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                    Section
                                                </Typography>
                                                <Typography variant="h5" fontWeight="700" sx={{ mt: 0.5, color: '#f5576c' }}>
                                                    {student.section?.section_name || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Tab 2: Parent Information */}
                {activeTab === 2 && student.parent && (
                    <Box sx={{ p: 3 }}>
                        <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', mb: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" fontWeight="600">
                                        Linked as: {student.parent.relation_type}
                                    </Typography>
                                    <Chip
                                        label={student.parent.relation_type}
                                        color="success"
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>

                                {/* Father's Details */}
                                {student.parent.father_full_name && (
                                    <>
                                        <Typography variant="subtitle1" fontWeight="600" color="primary" sx={{ mb: 2, mt: 3 }}>
                                            👨 Father's Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <InfoRow
                                                    icon={<IconUser size={20} />}
                                                    label="Full Name"
                                                    value={student.parent.father_full_name}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoRow
                                                    icon={<IconPhone size={20} />}
                                                    label="Phone Number"
                                                    value={student.parent.father_phone}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoRow
                                                    icon={<IconSchool size={20} />}
                                                    label="Occupation"
                                                    value={student.parent.father_occupation}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoRow
                                                    icon={<IconSchool size={20} />}
                                                    label="Qualification"
                                                    value={student.parent.father_qualification}
                                                />
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                {/* Mother's Details */}
                                {student.parent.mother_full_name && (
                                    <>
                                        <Divider sx={{ my: 3 }} />
                                        <Typography variant="subtitle1" fontWeight="600" color="primary" sx={{ mb: 2 }}>
                                            👩 Mother's Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <InfoRow
                                                    icon={<IconUser size={20} />}
                                                    label="Full Name"
                                                    value={student.parent.mother_full_name}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoRow
                                                    icon={<IconPhone size={20} />}
                                                    label="Phone Number"
                                                    value={student.parent.mother_phone}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoRow
                                                    icon={<IconSchool size={20} />}
                                                    label="Occupation"
                                                    value={student.parent.mother_occupation}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <InfoRow
                                                    icon={<IconSchool size={20} />}
                                                    label="Qualification"
                                                    value={student.parent.mother_qualification}
                                                />
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                {/* Contact Information */}
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="subtitle1" fontWeight="600" color="primary" sx={{ mb: 2 }}>
                                    📧 Contact Information
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <InfoRow
                                            icon={<IconMail size={20} />}
                                            label="Email"
                                            value={student.parent.email}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InfoRow
                                            icon={<IconPhone size={20} />}
                                            label="Primary Phone"
                                            value={student.parent.phone}
                                        />
                                    </Grid>
                                    {student.parent.address && (
                                        <Grid item xs={12}>
                                            <InfoRow
                                                icon={<IconMapPin size={20} />}
                                                label="Address"
                                                value={`${student.parent.address}${student.parent.city ? `, ${student.parent.city}` : ''}${student.parent.state ? `, ${student.parent.state}` : ''}${student.parent.postal_code ? ` - ${student.parent.postal_code}` : ''}`}
                                            />
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </DialogContent>

            {/* Footer */}
            <Box sx={{
                p: 2.5,
                borderTop: '1px solid #e0e0e0',
                bgcolor: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3
                    }}
                >
                    Close
                </Button>
                {onEdit && (
                    <Button
                        onClick={() => onEdit(student)}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1a3460 0%, #245086 100%)',
                            }
                        }}
                    >
                        Edit Profile
                    </Button>
                )}
            </Box>
        </Dialog>
    );
};

export default StudentDetailsDialog;
