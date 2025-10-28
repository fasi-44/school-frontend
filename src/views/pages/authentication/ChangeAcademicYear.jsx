// src/components/ChangeAcademicYear.jsx
import { Box, Select, MenuItem, FormControl, Chip, useMediaQuery, alpha } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from "@mui/system";
import { updateGlobalState } from '../../../store/slices/authSlice';

const ChangeAcademicYear = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { loggedUser, academicYear } = useSelector(state => ({
        loggedUser: state.globalState?.loggedUser || null,
        academicYear: state.globalState?.academicYear || null
    }));

    const academicYears = loggedUser?.academic_years || [];

    const handleAcademicYearChange = (event) => {
        const value = event.target.value;
        const selectedYear = academicYears.find(year => year.id === value);

        if (selectedYear) {
            console.log(
                `Academic Year changed from ${academicYear?.year_name || 'None'} to ${selectedYear.year_name} by user ${loggedUser?.username}`
            );
            dispatch(updateGlobalState({ academicYear: selectedYear }));
        }
    };

    if (!academicYears || academicYears.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                ml: { xs: 0, md: 1 },
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderRadius: 2,
                px: 1.5,
                py: 0.5
            }}
        >
            <FormControl size="small" variant="standard">
                <Select
                    id="academic-year-select"
                    value={academicYear?.id || ''}
                    onChange={handleAcademicYearChange}
                    disableUnderline
                    displayEmpty
                    sx={{
                        minWidth: isMobile ? 90 : 130,
                        fontWeight: 600,
                        color: 'primary.main',
                        '& .MuiSelect-select': {
                            py: 0.5,
                            fontSize: isMobile ? '0.875rem' : '0.95rem'
                        },
                        '& .MuiSelect-icon': {
                            color: 'primary.main'
                        }
                    }}
                >
                    {academicYears.map((year) => (
                        <MenuItem key={year.id} value={year.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {year.year_name}
                                {year.is_current && (
                                    <Chip
                                        label="Current"
                                        size="small"
                                        color="primary"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.65rem',
                                            fontWeight: 600
                                        }}
                                    />
                                )}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default ChangeAcademicYear;
