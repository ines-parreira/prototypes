import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import Navbar from '../../../common/components/Navbar'
import {hasRole} from '../../../../utils'

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

        const categories = [{
            name: 'You',
            links: [{
                to: 'profile',
                text: 'Your profile'
            }, {
                to: 'change-password',
                text: 'Change password'
            }, {
                to: 'api',
                text: 'API key'
            }]
        }, {
            name: 'General',
            links: [{
                requiredRole: 'admin',
                to: 'billing',
                text: 'Billing'
            }, {
                requiredRole: 'admin',
                to: 'manage-tags',
                text: 'Manage tags'
            }]
        }]

        return (
            <Navbar activeContent="settings">
                {categories.map(({name, links}, index) => (
                    <div
                        className="item"
                        key={index}
                    >
                        <h4>{name}</h4>

                        <div className="menu">
                            {links.map(({to, text, requiredRole}) => {
                                // hide link if user hasn't the required role
                                if (requiredRole && !hasRole(currentUser, requiredRole)) {
                                    return
                                }

                                const isActive = pathname.split('/').includes(to)
                                    || (/settings\/?$/.test(pathname) && to === 'profile')

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
                    </div>
                ))}
            </Navbar>
        )
    }
}
