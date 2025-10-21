import MainCard from '../../../ui-component/cards/MainCard';
import { useNavigate } from 'react-router';
import { IconPlus } from '@tabler/icons-react';
import TeachersList from './TeachersList';
import { Button, Fade } from '@mui/material';

const TeacherManagement = () => {
    const navigate = useNavigate();

    const createTeacher = () => {
        navigate('/teacher/create');
    }

    return (
        <>
            <MainCard
                title={'School Teachers List'}
                secondary={
                    <Button onClick={createTeacher} variant="contained" color="primary" size='small' startIcon={<IconPlus />}>
                        Create Teacher
                    </Button>
                }
            >
                <TeachersList />
            </MainCard>
        </>
    );
};

export default TeacherManagement;
