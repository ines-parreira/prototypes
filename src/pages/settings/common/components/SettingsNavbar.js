import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {fromJS} from 'immutable'
import Navbar from '../../../common/components/Navbar'
import {hasRole} from '../../../common/utils/user'

export default class SettingsNavbar extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired
    }

    render() {
        const {
            currentUser,
            location: {pathname}
        } = this.props
        const roles = currentUser.get('roles', fromJS([]))
        // links in the sidebar
        const links = [{
            requiredRole: 'admin',
            to: 'account',
            text: 'Account'
        }, {
            to: 'your-profile',
            text: 'Your profile'
        }]

        return (
            <Navbar currentUser={currentUser} activeContent="settings">
                <div className="menu">
                    {links.map(({to, text, requiredRole}) => {
                        // hide link if user hasn't the required role
                        if (requiredRole && !hasRole(roles, requiredRole)) {
                            return
                        }

                        const isActive = pathname.split('/').includes(to)
                            || (/settings\/?$/.test(pathname) && to === 'account')

                        return (
                            <Link
                                key={to}
                                to={`/app/settings/${to}`}
                                className={`item ${isActive ? 'active' : ''}`}
                            >
                                {text}
                            </Link>
                        )
                    })}
                </div>
            </Navbar>
        )
    }
}
