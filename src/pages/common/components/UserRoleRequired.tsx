import React, {ComponentProps, ComponentType} from 'react'
import {connect, ConnectedProps} from 'react-redux'

import {hasRole} from '../../../utils'
import history from '../../history'
import {UserRole} from '../../../config/types/user'
import {RootState} from '../../../state/types'

import NotAllowed from './NotAllowed'

// check user role before render the desired component
const withUserRoleRequired = (
    Component: ComponentType<Record<string, unknown>>,
    requiredRole: UserRole,
    redirectTo: string
) => {
    const UserRoleRequired = (
        props: ComponentProps<typeof Component> &
            ConnectedProps<typeof connector>
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
        return <NotAllowed />
    }

    const connector = connect((state: RootState) => ({
        currentUser: state.currentUser,
    }))

    return connector(UserRoleRequired)
}

export default withUserRoleRequired
