import { memo, useState } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItems from 'menu-items';

import { useGetMenuMaster } from 'api/menu';
import { useSelector } from 'react-redux';


const canSeeMenuItem = (currentUserRoleCode, itemAllowedRoles) => {
  // If the item doesn't specify any roles, it's visible to everyone by default.
  // This is useful for general items like "Typography", "Color", etc.
  if (!itemAllowedRoles || itemAllowedRoles.length === 0) {
    return true;
  }

  // If currentUserRoleCode is not available (e.g., user not logged in or role not loaded),
  // and the item requires specific roles, it should not be visible.
  if (!currentUserRoleCode) {
    return false;
  }

  // Check if the user's role_code is included in the item's allowed roles array.
  return itemAllowedRoles.includes(currentUserRoleCode);
};



// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const { loggedUser } = useSelector((state) => state.globalState || {});
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');

  const lastItem = null;

  let lastItemIndex = menuItems.items.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const filterAndMapMenuItems = (items, currentUserRole) => {
    return items
      .map(item => {
        if (item.type === 'group') {
          // For a group, first filter its children
          const filteredChildren = filterAndMapMenuItems(item.children || [], currentUserRole);

          // If the group has no visible children after filtering,
          // or if the group itself has a 'roles' property and the user
          // doesn't have the required role, then hide the group.
          // IMPORTANT: If a group *must* have children AND the user must match the group's role,
          // combine these conditions. For now, group visibility relies on child visibility.
          if (filteredChildren.length === 0) {
            return null; // Hide the group if no children are visible
          }

          // Return a new group object with only the visible children
          return { ...item, children: filteredChildren };

        } else if (item.type === 'item') {
          // For an individual item, check if the user has permission to see it
          if (canSeeMenuItem(currentUserRole, item.roles)) {
            return item; // Keep the item if user has role
          }
          return null; // Hide the item if user doesn't have role
        }
        // For any other type, or if a default behavior is desired for unknown types
        return item; // Or return null if unknown types should be hidden
      })
      .filter(Boolean); // Remove null entries (hidden items/groups)
  };

  // Filter the entire menuItems structure based on the current user's role
  const filteredNavItems = filterAndMapMenuItems(menuItems.items, (loggedUser?.role_obj?.role_code ?? loggedUser?.role));

  const navItems = filteredNavItems.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              {index !== 0 && <Divider sx={{ py: 0.5 }} />}
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
