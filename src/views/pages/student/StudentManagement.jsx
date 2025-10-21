import MainCard from '../../../ui-component/cards/MainCard';
import { useNavigate } from 'react-router';
import { Button } from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import StudentsList from './StudentList';

const StudentManagement = () => {
    const navigate = useNavigate();

    const createStudent = () => {
        navigate('/student/create');
    }

    return (
        <>
            <MainCard
                title={'Students List'}
                secondary={
                    <Button onClick={createStudent} variant="contained" color="primary" size='small' startIcon={<IconPlus />}>
                        Create Student
                    </Button>
                }
            >
                <StudentsList />
            </MainCard>
        </>
    );
};

export default StudentManagement;