import React, {ComponentType} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import RestrictedPage from 'pages/common/components/RestrictedPage'
import history from 'pages/history'
import {UserRole} from 'config/types/user'
import {PageSection} from 'config/pages'
import {RootState} from 'state/types'
import {hasRole} from 'utils'

// check user role before render the desired component
const withUserRoleRequired = (
    Component: ComponentType<any>,
    requiredRole: UserRole,
    restrictedPage?: PageSection,
    redirectTo?: string
) => {
    const UserRoleRequired = (
        props: Record<string, unknown> & ConnectedProps<typeof connector>
    ) => {
        // user has required role
        if (requiredRole && hasRole(props.currentUser, requiredRole)) {
            return <Component {...props} />
        }

        // user hasn't required role
        if (redirectTo) {
            history.push(redirectTo)
            return null
        }
        return (
            <RestrictedPage requiredRole={requiredRole} page={restrictedPage} />
        )
    }

    const connector = connect((state: RootState) => ({
        currentUser: state.currentUser,
    }))

    return connector(UserRoleRequired)
}

export default withUserRoleRequired
