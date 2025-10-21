export const checkUserHasRoleAndPermission = (roleObj, permission) => {
    if (roleObj?.['permissions']?.length > 0 && roleObj?.['permissions'].includes(permission)) {
        return true;
    } else
        return false;
}

export const getUsername = (data, fields) => {
    console.log(data, fields)
    let name = []
    fields?.map(field => {
        if (data[field]) {
            name.push(data[field])
        }
    })
    return name?.join(" ");
}