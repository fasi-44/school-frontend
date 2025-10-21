import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, Grid, Button, Chip } from '@mui/material';
import { useSelector } from 'react-redux';
import customAxios from '../../../utils/axiosConfig';
import Loader from '../../../ui-component/Loader';
import MainCard from '../../../ui-component/cards/MainCard';
import { TEACHERS_API_BASE_URL, SUBJECTS_API_BASE_URL } from '../../../ApiConstants';

const TeacherSubject = () => {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [assignedSubjectIds, setAssignedSubjectIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTeachers();
        fetchSubjects();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.get(TEACHERS_API_BASE_URL + "/list/" + loggedUser?.skid);
            if (resp.data.code === 200) {
                setTeachers(resp.data.teachers || []);
            }
        } catch (e) {
            console.error("Error fetching teachers", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const resp = await customAxios.get(SUBJECTS_API_BASE_URL + "/list/" + loggedUser?.skid);
            if (resp.data.code === 200) {
                setSubjects(resp.data.data || []);
            }
        } catch (e) {
            console.error("Error fetching subjects", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignedSubjects = async (teacherId) => {
        try {
            const resp = await customAxios.get(TEACHERS_API_BASE_URL + "/" + teacherId + "/subjects/" + loggedUser?.skid);
            if (resp.data.code === 200) {
                setAssignedSubjectIds(resp.data.subject_ids || []);
            } else {
                setAssignedSubjectIds([]);
            }
        } catch (e) {
            console.error("Error fetching assigned subjects", e);
        }
    };

    const handleTeacherSelect = (teacher) => {
        setSelectedTeacher(teacher);
        setAssignedSubjectIds([]);
        if (teacher?.id) {
            fetchAssignedSubjects(teacher.id);
        }
    };

    const handleSave = async () => {
        try {
            const resp = await customAxios.post(`${TEACHERS_API_BASE_URL}/${selectedTeacher.id}/assign-subjects/${loggedUser?.skid}`, {
                subject_ids: assignedSubjectIds
            });

            if (resp.data.code === 200) {
                alert("Subjects assigned successfully!");
            } else {
                alert("Failed to assign subjects.");
            }
        } catch (e) {
            console.error("Error assigning subjects", e);
            alert("Something went wrong.");
        }
    };

    return (
        <>
            <Loader loading={loading} />
            <MainCard title="Assign Subjects to Teacher">
                <Grid container spacing={2}>
                    <Grid item size={{ xl: 4, lg: 4, md: 6, sm: 6, xs: 12 }}>
                        <Autocomplete
                            options={teachers}
                            getOptionLabel={(t) => `${t.first_name} ${t.last_name}`}
                            onChange={(e, value) => handleTeacherSelect(value)}
                            renderInput={(params) => <TextField {...params} label="Select Teacher" />}
                        />
                    </Grid>

                    <Grid item size={{ xl: 4, lg: 4, md: 6, sm: 6, xs: 12 }}>
                        <Autocomplete
                            multiple
                            options={subjects}
                            getOptionLabel={(option) => option.subject_name}
                            value={subjects.filter(s => assignedSubjectIds.includes(s.id))}
                            onChange={(e, value) => {
                                const ids = value.map(v => v.id);
                                setAssignedSubjectIds(ids);
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Assign Subjects" placeholder="Select subjects" />
                            )}
                            disabled={!selectedTeacher}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant="contained" color="primary"
                            onClick={handleSave}
                            disabled={!selectedTeacher}
                        >
                            Save Assignments
                        </Button>
                    </Grid>
                </Grid>

                <Grid container>
                    {/* subjects list or teachers list with the assigned subjects in table */}
                </Grid>
            </MainCard>
        </>
    );
};

export default TeacherSubject;
