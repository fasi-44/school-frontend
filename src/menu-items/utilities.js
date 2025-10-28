// assets
import {
  IconTypography, IconPalette, IconShadow, IconWindmill, IconUser, IconUsers,
  IconPlus, IconList, IconListNumbers, IconUserPlus, IconUsersPlus,
  IconSchool, IconBook, IconShieldBolt, IconCalendarTime, IconUserCheck, IconUsersGroup,
  IconSpeakerphone
} from '@tabler/icons-react';

// constant
const icons = {
  IconTypography, IconPalette, IconShadow, IconWindmill, IconPlus, IconList, IconUser, IconUsers,
  IconListNumbers, IconUserPlus, IconUsersPlus, IconSchool, IconBook, IconShieldBolt, IconCalendarTime,
  IconUserCheck, IconUsersGroup, IconSpeakerphone
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'create-school',
      title: 'Create School',
      type: 'item',
      url: '/school/create',
      icon: icons.IconPlus,
      breadcrumbs: false,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'list-school',
      title: 'List',
      type: 'item',
      url: '/school/list',
      icon: icons.IconList,
      breadcrumbs: false,
      roles: ['SUPER_ADMIN'],
    },
    {
      id: 'user-list',
      title: 'Users List',
      type: 'item',
      url: '/school/users/list',
      icon: icons.IconListNumbers,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN'],
    },
    {
      id: 'teacher-management',
      title: 'Teachers',
      type: 'item',
      url: '/teacher/list',
      icon: icons.IconUser,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN'],
    },
    {
      id: 'student-management',
      title: 'Students',
      type: 'item',
      url: '/student/list',
      icon: icons.IconUsers,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN'],
    },
    {
      id: 'parent-management',
      title: 'Parents',
      type: 'item',
      url: '/parent/list',
      icon: icons.IconUsersGroup,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN'],
    },
    {
      id: 'classes',
      title: 'Classes',
      type: 'item',
      url: '/classes',
      icon: icons.IconSchool,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN'],
    },
    {
      id: 'subjects',
      title: 'Subjects',
      type: 'item',
      url: '/subjects',
      icon: icons.IconBook,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN'],
    },
    {
      id: 'teacher-subjects',
      title: 'Teacher-Subjects',
      type: 'item',
      url: '/teacher-subjects',
      icon: icons.IconBook,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN'],
    },
    {
      id: 'announcements',
      title: 'Announcements',
      type: 'item',
      url: '/announcements/list',
      icon: icons.IconSpeakerphone,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      id: 'attendence-view',
      title: 'Attendence',
      type: 'item',
      url: '/attendance/view',
      icon: icons.IconUserCheck,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN', 'TEACHER'],
    },
    {
      id: 'timetable-management',
      title: 'Timetable',
      type: 'item',
      url: '/timetable/list',
      icon: icons.IconCalendarTime,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN', 'PRINCIPAL'],
    },
    {
      id: 'roles-and-permissions',
      title: 'Roles & Permissions',
      type: 'item',
      url: '/roles-and-permissions',
      icon: icons.IconShieldBolt,
      breadcrumbs: false,
      roles: ['SCHOOL_ADMIN'],
    },
  ]
};

export default utilities;
