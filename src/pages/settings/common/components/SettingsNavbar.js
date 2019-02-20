import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Link} from 'react-router'

import {hasRole} from '../../../../utils'
import {ADMIN_ROLE, AGENT_ROLE} from '../../../../config/user'

type Props = {
    currentUser: Object,
    location: Object
}

export default class SettingsNavbar extends React.Component<Props> {
    static propTypes = {}
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
            icon: 'person',
            links: [{
                to: 'profile',
                text: 'Your profile'
            }, {
                to: 'change-password',
                text: 'Change password'
            }, {
                requiredRole: ADMIN_ROLE,
                to: 'api',
                text: 'REST API',
                className: 'd-none d-md-block',
            }]
        }, {
            name: 'General',
            icon: 'settings',
            links: [{
                requiredRole: ADMIN_ROLE,
                to: 'integrations',
                text: 'Integrations',
                className: 'd-none d-md-block',
            }, {
                requiredRole: ADMIN_ROLE,
                to: 'rules',
                text: 'Rules',
                className: 'd-none d-md-block',
            }, {
                requiredRole: ADMIN_ROLE,
                to: 'team',
                text: 'Team members'
            }, {
                requiredRole: ADMIN_ROLE,
                to: 'billing',
                text: 'Billing & Usage',
                className: 'd-none d-md-block',
            }, {
                requiredRole: AGENT_ROLE,
                to: 'manage-tags',
                text: 'Tags',
                className: 'd-none d-md-block',
            }, {
                requiredRole: ADMIN_ROLE,
                to: 'import-data',
                text: 'Import data',
                className: 'd-none d-md-block'
            }, {
                requiredRole: ADMIN_ROLE,
                to: 'business-hours',
                text: 'Business hours',
                className: 'd-none d-md-block'
            }]
        }]

        // @xarg: temporary hiding of the requests navigation
        if (window.DEVELOPMENT || document.cookie.includes('is_gorgias_staff')) {
            categories[1].links.push({
                requiredRole: ADMIN_ROLE,
                to: 'requests',
                text: 'Requests',
                className: 'd-none d-md-block hidden-sm-down',
            })
        }

        categories[1].links.splice(2, 0, {
            requiredRole: ADMIN_ROLE,
            to: 'satisfaction-surveys',
            text: 'Satisfaction',
            className: 'd-none d-md-block'
        })

        return (
            <div>
                {
                    categories.map(({name, icon, links}, index) => {
                        if (!links.length) {
                            return null
                        }

                        return (
                            <div
                                className="item"
                                key={index}
                            >
                                <h4><i className="material-icons">{icon}</i> {name}</h4>

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
                        )
                    })

                }
            </div>
        )
    }
}
