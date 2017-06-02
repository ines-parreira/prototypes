import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router'
import {hasRole} from '../../../../utils'

export default class SettingsNavbar extends React.Component {
    static propTypes = {
        currentUser: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired
    }

    static contextTypes = {
        closePanel: PropTypes.func.isRequired,
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
                text: 'API key',
                className: 'hidden-sm-down',
            }]
        }, {
            name: 'General',
            links: [{
                to: 'rules',
                text: 'Rules',
                className: 'hidden-sm-down',
            }, {
                requiredRole: 'admin',
                to: 'team',
                text: 'Team members'
            }, {
                requiredRole: 'admin',
                to: 'billing',
                text: 'Billing',
                className: 'hidden-sm-down',
            }, {
                requiredRole: 'admin',
                to: 'manage-tags',
                text: 'Tags',
                className: 'hidden-sm-down',
            }]
        }]

        return (
            <div>
                {
                    categories.map(({name, links}, index) => (
                        <div
                            className="item"
                            key={index}
                        >
                            <h4>{name}</h4>

                            <div className="menu">
                                {
                                    links.map(({to, text, requiredRole, className}) => {
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
                                                className={classnames(className, 'item', {
                                                    active: isActive,
                                                })}
                                                onClick={() => {
                                                    this.context.closePanel()
                                                }}
                                            >
                                                {text}
                                            </Link>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }
}
