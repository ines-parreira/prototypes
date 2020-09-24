//@flow
import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import {Link} from 'react-router'

import {hasRole} from '../../../../utils.ts'
import {ADMIN_ROLE, AGENT_ROLE} from '../../../../config/user'
import type {UserRole} from '../../../../config/types/user'

type Props = {
    currentUser: Object,
    location: Object,
}

type CategoryLink = {
    className?: string,
    requiredRole?: UserRole,
    text: string,
    to: string,
}

type Category = {
    icon: string,
    links: CategoryLink[],
    name: string,
}

export default class SettingsNavbar extends React.Component<Props> {
    static propTypes = {}
    static contextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    render() {
        const {
            currentUser,
            location: {pathname},
        } = this.props

        const categories: Category[] = [
            {
                name: 'You',
                icon: 'person',
                links: [
                    {
                        to: 'profile',
                        text: 'Your profile',
                    },
                    {
                        to: 'change-password',
                        text: 'Change password',
                    },
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'api',
                        text: 'REST API',
                        className: 'd-none d-md-block',
                    },
                ],
            },
            {
                name: 'General',
                icon: 'settings',
                links: [
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'integrations',
                        text: 'Integrations',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: AGENT_ROLE,
                        to: 'rules',
                        text: 'Rules',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: AGENT_ROLE,
                        to: 'manage-tags',
                        text: 'Tags',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: AGENT_ROLE,
                        to: 'macros',
                        text: 'Macros',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'satisfaction-surveys',
                        text: 'Satisfaction',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'billing',
                        text: 'Billing & Usage',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'import-data',
                        text: 'Import data',
                        className: 'd-none d-md-block',
                    },
                ],
            },
            {
                name: 'Users & Teams',
                icon: 'group',
                links: [
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'users',
                        text: 'Users',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'teams',
                        text: 'Teams',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'audit',
                        text: 'Audit logs',
                        className: 'd-none d-md-block',
                    },
                ],
            },
            {
                name: 'Availability',
                icon: 'alarm',
                links: [
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'business-hours',
                        text: 'Business hours',
                        className: 'd-none d-md-block',
                    },
                    {
                        requiredRole: ADMIN_ROLE,
                        to: 'ticket-assignment',
                        text: 'Ticket assignment',
                        className: 'd-none d-md-block',
                    },
                ],
            },
        ]

        return (
            <div>
                {categories.map(({name, icon, links}, index) => {
                    const displayedLinks = links
                        .map(({to, text, requiredRole, className}) => {
                            // hide link if user hasn't the required role
                            if (
                                requiredRole &&
                                !hasRole(currentUser, requiredRole)
                            ) {
                                return null
                            }

                            const isActive =
                                pathname.split('/').includes(to) ||
                                (/settings\/?$/.test(pathname) &&
                                    to === 'profile')

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
                        .filter((link) => link)

                    // Hide the category if there's nothing to display
                    if (!displayedLinks.length) {
                        return null
                    }

                    return (
                        <div className="item" key={index}>
                            <h4>
                                <i className="material-icons">{icon}</i> {name}
                            </h4>

                            <div className="menu">{displayedLinks}</div>
                        </div>
                    )
                })}
            </div>
        )
    }
}
