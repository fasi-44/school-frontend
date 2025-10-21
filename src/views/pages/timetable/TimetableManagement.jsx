import MainCard from '../../../ui-component/cards/MainCard';
import { useNavigate } from 'react-router';
import { Button, Fade } from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import TimetableList from './TimetableList';

const TimetableManagement = () => {
    const navigate = useNavigate();

    const createTimetable = () => {
        navigate('/timetable/create');
    }

    return (
        <>
            <Fade in timeout={600}>
                <MainCard
                    title={'School Timetable List'}
                    secondary={
                        <Button onClick={createTimetable}
                            variant="contained"
                            size="small"
                            color="primary"
                            startIcon={<IconPlus />}
                        >
                            Create Timetable
                        </Button>
                    }
                >
                    <TimetableList />
                </MainCard>
            </Fade>
        </>
    );
};

export default TimetableManagement;
