import React from 'react'
import classnames from 'classnames'
import {Link, useLocation} from 'react-router-dom'

import css from 'assets/css/navbar.less'

import {hasRole} from 'utils'
import {ADMIN_ROLE, AGENT_ROLE} from 'config/user'
import {UserRole} from 'config/types/user'
import {IntegrationType} from 'models/integration/types'
import {closePanels} from 'state/layout/actions'
import {getCurrentUser} from 'state/currentUser/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import Navbar from 'pages/common/components/Navbar'
import {buildPasswordAnd2FaText} from '../yourProfile/twoFactorAuthentication/utils'

type CategoryLink = {
    className?: string
    requiredRole?: UserRole
    text: string
    to: string
    isHidden?: boolean
}

type Category = {
    icon: string
    links: CategoryLink[]
    name: string
}

const CATEGORIES: Category[] = [
    {
        name: 'Channels',
        icon: 'message',
        links: [
            {
                requiredRole: ADMIN_ROLE,
                to: `channels/${IntegrationType.Email}`,
                text: 'Email',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: `channels/${IntegrationType.GorgiasChat}`,
                text: 'Chat',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: `channels/${IntegrationType.Phone}`,
                text: 'Voice',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: `channels/${IntegrationType.Sms}`,
                text: 'SMS',
            },
            {
                to: 'help-center',
                text: 'Help Center',
            },
        ],
    },
    {
        name: 'Automation',
        icon: 'bolt',
        links: [
            {
                requiredRole: AGENT_ROLE,
                to: 'macros',
                text: 'Macros',
            },
            {
                requiredRole: AGENT_ROLE,
                to: 'rules',
                text: 'Rules',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'self-service',
                text: 'Self-service',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'ticket-assignment',
                text: 'Ticket assignment',
            },
        ],
    },
    {
        name: 'App Store',
        icon: 'apps',
        links: [
            {
                requiredRole: ADMIN_ROLE,
                to: 'integrations',
                text: 'Apps & integrations',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: `integrations/${IntegrationType.Http}`,
                text: 'HTTP integration',
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
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'teams',
                text: 'Teams',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'audit',
                text: 'Audit logs',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'access',
                text: 'Access management',
            },
        ],
    },
    {
        name: 'Account',
        icon: 'business_center',
        links: [
            {
                requiredRole: ADMIN_ROLE,
                to: 'phone-numbers',
                text: 'Phone numbers',
            },
            {
                requiredRole: AGENT_ROLE,
                to: 'manage-tags',
                text: 'Tags',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'business-hours',
                text: 'Business hours',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'satisfaction-surveys',
                text: 'Satisfaction survey',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'billing',
                text: 'Billing & usage',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'import-data',
                text: 'Import data',
            },
        ],
    },
    {
        name: 'You',
        icon: 'person',
        links: [
            {
                to: 'profile',
                text: 'Your profile',
            },
            {
                to: 'password-2fa',
                text: 'Password & 2FA',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'api',
                text: 'REST API',
            },
        ],
    },
]

const SettingsNavbar = () => {
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(getCurrentUser)
    const account = useAppSelector(getCurrentAccountState)
    const pathname = useLocation().pathname

    return (
        <Navbar activeContent="settings">
            {CATEGORIES.map(({name, icon, links}, index) => {
                const displayedLinks = links
                    .filter((link) => !link.isHidden)
                    .map(({to, text, requiredRole}) => {
                        let computedText = text
                        if (
                            requiredRole &&
                            !hasRole(currentUser, requiredRole)
                        ) {
                            return null
                        }

                        if (to === 'password-2fa') {
                            computedText = buildPasswordAnd2FaText(
                                currentUser.get('has_password')
                            )
                        }

                        let isActive =
                            pathname.startsWith(`/app/settings/${to}`) ||
                            (/settings\/?$/.test(pathname) &&
                                to === 'channels/email')

                        // TODO(@Manuel): remove this edge case once the http integration has its own route
                        if (
                            isActive &&
                            pathname.includes('integrations/http') &&
                            to.match(/.*integrations(\/)?$/)
                        ) {
                            isActive = false
                        }

                        return (
                            <Link
                                key={to}
                                to={`/app/settings/${to}`}
                                className={classnames(css.link, {
                                    active: isActive,
                                })}
                                onClick={() => {
                                    logEvent(SegmentEvent.IntegrationClicked, {
                                        title: text,
                                        account_domain: account.get('domain'),
                                    })
                                    dispatch(closePanels())
                                }}
                            >
                                {computedText}
                            </Link>
                        )
                    })
                    .filter((link) => link)

                // Hide the category if there's nothing to display
                if (!displayedLinks.length) {
                    return null
                }

                return (
                    <div className={css.category} key={index}>
                        <h4 className={css['category-title']}>
                            <i
                                className={classnames(
                                    'material-icons',
                                    css.icon
                                )}
                            >
                                {icon}
                            </i>
                            {name}
                        </h4>

                        <div className={css.menu}>{displayedLinks}</div>
                    </div>
                )
            })}
        </Navbar>
    )
}

export default SettingsNavbar
