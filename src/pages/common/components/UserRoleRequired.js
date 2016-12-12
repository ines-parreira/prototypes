import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {browserHistory} from 'react-router'
import {fromJS} from 'immutable'
import NotAllowed from './NotAllowed'

// check user role before render the desired component
const userRoleRequired = (Component, requiredRole, redirectTo) => {
    const UserRoleRequired = (props) => {
        // user has required role
        if (props.roles.includes(requiredRole)) {
            return <Component {...props}/>
        }

        // user hasn't required role
        if (redirectTo) {
            browserHistory.push(redirectTo)
            return null
        }
        return <NotAllowed/>
    }

    UserRoleRequired.propTypes = {
        roles: PropTypes.object.isRequired
    }

    function mapStateToProps(state) {
        return {
            roles: state.currentUser.get('roles', fromJS([])).map(role => role.get('name'))
        }
    }

    return connect(mapStateToProps)(UserRoleRequired)
}

export default userRoleRequired
