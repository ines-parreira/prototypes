import React, {ComponentType} from 'react'
import _memoize from 'lodash/memoize'
import {RouteComponentProps} from 'react-router-dom'

import {getCurrentUserState} from 'state/currentUser/selectors'
import RestrictedPage from 'pages/common/components/RestrictedPage'
import history from 'pages/history'
import {UserRole} from 'config/types/user'
import {PageSection} from 'config/pages'
import {hasRole} from 'utils'
import useAppSelector from 'hooks/useAppSelector'

// check user role before rendering the desired component
// You can discard RouteComponentProps if we ever change react-router
export function rootWithUserRoleRequired<
    P extends Record<string, unknown> | RouteComponentProps
>(
    Component: ComponentType<P>,
    requiredRole?: UserRole,
    restrictedPage?: PageSection,
    redirectTo?: string
) {
    const UserRoleRequired = (props: P) => {
        const currentUser = useAppSelector(getCurrentUserState)
        if (!requiredRole) return <Component {...props} />

        // user has required role
        if (hasRole(currentUser, requiredRole)) {
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

export const memoizedWithUserRoleRequired = _memoize(
    rootWithUserRoleRequired
) as typeof rootWithUserRoleRequired

export default memoizedWithUserRoleRequired
