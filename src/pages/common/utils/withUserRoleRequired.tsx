import React, {ComponentType} from 'react'

import {getCurrentUserState} from 'state/currentUser/selectors'
import RestrictedPage from 'pages/common/components/RestrictedPage'
import history from 'pages/history'
import {UserRole} from 'config/types/user'
import {PageSection} from 'config/pages'
import {hasRole} from 'utils'
import useAppSelector from 'hooks/useAppSelector'

// check user role before render the desired component
const withUserRoleRequired = (
    Component: ComponentType<any>,
    requiredRole: UserRole,
    restrictedPage?: PageSection,
    redirectTo?: string
) => {
    const UserRoleRequired = (props: Record<string, unknown>) => {
        const currentUser = useAppSelector(getCurrentUserState)
        // user has required role
        if (requiredRole && hasRole(currentUser, requiredRole)) {
            return <Component {...props} />
        }

        // user hasn't required role
        if (redirectTo) {
            history.replace(redirectTo)
            return null
        }
        return (
            <RestrictedPage requiredRole={requiredRole} page={restrictedPage} />
        )
    }
    return UserRoleRequired
}

export default withUserRoleRequired
