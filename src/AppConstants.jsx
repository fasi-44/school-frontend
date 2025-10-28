export const labelStyles = {
    fontWeight: 500,
    fontSize: '0.95rem',
    color: 'text.primary'
};

export const inputStyles = {
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    '&.Mui-focused': {
        boxShadow: `0 4px 20px ${"blue"}20`,
    }
};

export const schoolData = {
    schoolName: 'ABC International School',
    schoolAddress: '123 Education Street, City - 123456',
    schoolPhone: '+91 1234567890',
    schoolEmail: 'info@school.com',
    schoolLogo: null,
    companyWebsite: 'Powered by Klopterz.com'
};

export const announcementTypes = [
    { value: 'General', label: 'General' },
    { value: 'Academic', label: 'Academic' },
    { value: 'Examination', label: 'Examination' },
    { value: 'Event', label: 'Event' },
    { value: 'Holiday', label: 'Holiday' },
    { value: 'Urgent', label: 'Urgent' },
    { value: 'Fee Related', label: 'Fee Related' },
    { value: 'SPORTS', label: 'SPORTS' }
];

export const priorities = [
    { value: 'Low', label: 'Low', color: 'default' },
    { value: 'Normal', label: 'Normal', color: 'primary' },
    { value: 'High', label: 'High', color: 'warning' },
    { value: 'Urgent', label: 'Urgent', color: 'error' }
];

export const targetAudiences = [
    { value: 'All Users', label: 'All Users' },
    { value: 'All Students', label: 'All Students' },
    { value: 'All Teachers', label: 'All Teachers' },
    { value: 'All Parents', label: 'All Parents' },
    { value: 'Specific Classes', label: 'Specific Classes' },
    { value: 'Specific Sections', label: 'Specific Sections' }
];