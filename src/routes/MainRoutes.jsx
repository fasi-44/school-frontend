import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ProtectedRoute from './ProtectedRoute';
import AttendanceMark from '../views/pages/attendance/AttendenceMark';
import FeeStructureList from '../views/pages/fees/FeeStructureList';
import FeeAssignment from '../views/pages/fees/FeeAssignment';
import FeeCollection from '../views/pages/fees/FeeCollection';
import FeeStructureCreate from '../views/pages/fees/FeeStructureCreate';
import AttendanceView from '../views/pages/attendance/AttendanceView';
import TimetableView from '../views/pages/timetable/TimetableView';
import TimetableEdit from '../views/pages/timetable/TimetableEdit';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

const SchoolCreateOrUpdate = Loadable(lazy(() => import('../views/pages/school_management/SchoolCreateOrUpdate')));
const SchoolsList = Loadable(lazy(() => import('../views/pages/school_management/SchoolsList')));
const TeacherManagement = Loadable(lazy(() => import('../views/pages/teacher/TeacherManagement')));
const TeacherCreateOrUpdate = Loadable(lazy(() => import('../views/pages/teacher/TeacherCreateOrUpdate')));
const StudentManagement = Loadable(lazy(() => import('../views/pages/student/StudentManagement')));
const StudentSingleOrBulkTabPanel = Loadable(lazy(() => import('../views/pages/student/StudentSingleOrBulkTabPanel')));
const ParentManagement = Loadable(lazy(() => import('../views/pages/parent/ParentManagement')));
const ParentCreate = Loadable(lazy(() => import('../views/pages/parent/ParentCreate')));
const SchoolUsersList = Loadable(lazy(() => import('../views/pages/school_admin/SchoolUserList')));
const Classes = Loadable(lazy(() => import('../views/pages/classes-sections/Classes')));
const ClassSubjects = Loadable(lazy(() => import('../views/pages/classes-sections/ClassSubjects')));
const SectionStudents = Loadable(lazy(() => import('../views/pages/classes-sections/SectionStudents')));
const SectionSubjects = Loadable(lazy(() => import('../views/pages/classes-sections/SectionSubjects')));
const Subjects = Loadable(lazy(() => import('../views/pages/subjects/Subjects')));
const TeacherSubject = Loadable(lazy(() => import('../views/pages/teacher/TeacherSubject')));
const RolesAndPermissions = Loadable(lazy(() => import('../views/pages/roles-permissions/RolesAndPermissions')));
const Timetable = Loadable(lazy(() => import('../views/pages/timetable/Timetable')));
const TimetableManagement = Loadable(lazy(() => import('../views/pages/timetable/TimetableManagement')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'dashboard',
      element: <DashboardDefault />
    },
    // {
    //   path: 'dashboard',
    //   children: [
    //     {
    //       path: 'default',
    //       element: <DashboardDefault />
    //     }
    //   ]
    // },

    {
      path: "/school/create",
      element: <ProtectedRoute> <SchoolCreateOrUpdate /></ProtectedRoute>
    },
    {
      path: "/school/update",
      element: <ProtectedRoute> <SchoolCreateOrUpdate /></ProtectedRoute>
    },
    {
      path: "/school/list",
      element: <ProtectedRoute> <SchoolsList /></ProtectedRoute>
    },
    {
      path: "/teacher/list",
      element: <TeacherManagement />
    },
    {
      path: "/teacher/create",
      element: <TeacherCreateOrUpdate />
    },
    {
      path: "/teacher/update",
      element: <TeacherCreateOrUpdate />
    },
    {
      path: "/student/list",
      element: <StudentManagement />
    },
    {
      path: "/student/create",
      element: <StudentSingleOrBulkTabPanel />
    },
    {
      path: "/student/update/:studentId",
      element: <StudentSingleOrBulkTabPanel />
    },
    {
      path: "/parent/list",
      element: <ParentManagement />
    },
    {
      path: "/parent/create",
      element: <ParentCreate />
    },
    {
      path: "/classes",
      element: <Classes />
    },
    {
      path: "/section/:sectionId/students",
      element: <SectionStudents />
    },
    {
      path: "/class/:classId/subjects",
      element: <ClassSubjects />
    },
    {
      path: "/section/:sectionId/subjects",
      element: <SectionSubjects />
    },
    {
      path: "/subjects",
      element: <Subjects />
    },
    {
      path: "/teacher-subjects",
      element: <TeacherSubject />
    },
    {
      path: "/school/users/list",
      element: <SchoolUsersList />
    },
    {
      path: "/attendance/view",
      element: <AttendanceView />
    },
    {
      path: "/attendance/mark",
      element: <AttendanceMark />
    },
    {
      path: "/attendance/mark?date=:date&class=:class&section:section",
      element: <AttendanceMark />
    },
    // TimeTables
    {
      path: "/timetable/list",
      element: <TimetableManagement />
    },
    {
      path: "/timetable/create",
      element: <Timetable />
    },
    {
      path: "/timetable/edit/:id",
      element: <TimetableEdit />
    },
    {
      path: "/timetable/view/:id",
      element: <TimetableView />
    },
    {
      path: "/roles-and-permissions",
      element: <RolesAndPermissions />
    },
    {
      path: "/fee/structures",
      element: <FeeStructureList />
    },
    {
      path: "/fee/structure/create",
      element: <FeeStructureCreate />
    },
    {
      path: "/fee/structure/edit/:class_id",
      element: <FeeStructureCreate />
    },
    {
      path: "/fee/assignment",
      element: <FeeAssignment />
    },
    {
      path: "/fee/collection",
      element: <FeeCollection />
    },
    // {
    //   path: "/fee/reports",
    //   element: <FeeStructureList />
    // },

  ]
};

export default MainRoutes;
