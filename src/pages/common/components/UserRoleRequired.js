import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'

import {hasRole} from '../../../utils'

import NotAllowed from './NotAllowed'
// check user role before render the desired component
const userRoleRequired = (Component, requiredRole, redirectTo) => {
    const UserRoleRequired = (props) => {
        // user has required role
        if (requiredRole && hasRole(props.currentUser, requiredRole)) {
            return <Component {...props} />
        }

        // user hasn't required role
        if (redirectTo) {
            browserHistory.push(redirectTo)
            return null
        }
        return <NotAllowed />
    }

    UserRoleRequired.propTypes = {
        currentUser: PropTypes.object.isRequired,
    }

    function mapStateToProps(state) {
        return {
            currentUser: state.currentUser,
        }
    }

    return connect(mapStateToProps)(UserRoleRequired)
}

export default userRoleRequired
