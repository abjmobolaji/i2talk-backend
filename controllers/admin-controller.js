


// SQL TO GET ALL PERMISSIONS, AND PERMISSIONS DESCRIPTION
/* 
SELECT permissionName, permissionDescription FROM permissions INNER JOIN roles_permissions ON roles_permissions.permissionsID = permissions.permissionID INNER JOIN roles ON roles.roleID = roles_permissions.roleID INNER JOIN user_roles ON user_roles.roleID = roles_permissions.roleID
*/