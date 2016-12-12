// Check if a user has a role
export function hasRole(userRoles = [], requiredRole) {
    const roles = userRoles.map(role => role.get('name'))
    return roles.includes(requiredRole)
}
