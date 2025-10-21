import React, { lazy, useState } from "react";
import Loadable from 'ui-component/Loadable';
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Tabs,
    Tab,
    Fade,
    useTheme,
    Paper
} from "@mui/material";
import { PersonAdd, CloudUpload } from "@mui/icons-material";
import MainCard from "../../../ui-component/cards/MainCard";

const SingleStudentCreate = Loadable(lazy(() => import('./SingleStudentCreate')));
const BulkStudentCreate = Loadable(lazy(() => import('./BulkStudentCreate')));

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`student-tabpanel-${index}`}
            aria-labelledby={`student-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `student-tab-${index}`,
        'aria-controls': `student-tabpanel-${index}`,
    };
}

const StudentSingleOrBulkTabPanel = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'create';
    const studentData = location.state?.user || {};

    // If it's update mode, show only the single student form
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const tabStyles = {
        minHeight: 'auto',
        textTransform: 'none',
        fontSize: '1rem',
        fontWeight: 500,
        padding: '12px 24px',
        marginRight: 1,
        borderRadius: '8px',
        backgroundColor: "#ede7f6",
        '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
        '&:hover': {
            backgroundColor: "#0268b9",
            color: theme.palette.primary.contrastText,
        }
    };

    const getTitle = () => {
        if (mode === 'update') return "Update Student";
        return tabValue === 0 ? "Create Student" : "Bulk Import Students";
    };

    // If update mode, show only single student form
    if (mode === 'update') {
        return (
            <MainCard title="Update Student">
                <SingleStudentCreate
                    mode={mode}
                    studentData={studentData}
                    navigate={navigate}
                />
            </MainCard>
        );
    }

    return (
        <MainCard
            title={getTitle()}
            content={false}
            sx={{
                '& .MuiCardContent-root': {
                    padding: 0
                }
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: 'grey.50'
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTabs-indicator': {
                            display: 'none'
                        },
                        '& .MuiTabs-flexContainer': {
                            gap: 1,
                            padding: '8px 16px'
                        }
                    }}
                >
                    <Tab
                        icon={<PersonAdd />}
                        iconPosition="start"
                        label="Single Student"
                        {...a11yProps(0)}
                        sx={tabStyles}
                    />
                    <Tab
                        icon={<CloudUpload />}
                        iconPosition="start"
                        label="Bulk Import"
                        {...a11yProps(1)}
                        sx={tabStyles}
                    />
                </Tabs>
            </Paper>

            <Box sx={{ p: 3 }}>
                <TabPanel value={tabValue} index={0}>
                    <SingleStudentCreate
                        mode={mode}
                        studentData={studentData}
                        navigate={navigate}
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <BulkStudentCreate navigate={navigate} />
                </TabPanel>
            </Box>
        </MainCard>
    );
}

export default StudentSingleOrBulkTabPanel;