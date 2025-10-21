// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const fees = {
  id: 'fee management',
  title: 'Fee Management',
  caption: 'Manage student fees',
  icon: icons.IconKey,
  type: 'group',
  children: [
    {
      id: 'fee-structures',
      title: 'Fee Structures',
      type: 'item',
      url: '/fee/structures',
      icon: icons.IconPlus,
      breadcrumbs: false,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
    },
    {
      id: 'fee-assignment',
      title: 'Fee Assignment',
      type: 'item',
      url: '/fee/assignment',
      icon: icons.IconPlus,
      breadcrumbs: false,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
    },
    {
      id: 'fee-collection',
      title: 'Fee Collection',
      type: 'item',
      url: '/fee/collection',
      icon: icons.IconPlus,
      breadcrumbs: false,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
    },
    {
      id: 'fee-reports',
      title: 'Fee Reports',
      type: 'item',
      url: '/fee/reports',
      icon: icons.IconPlus,
      breadcrumbs: false,
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
    },
  ]
};

export default fees;
