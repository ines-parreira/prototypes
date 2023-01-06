import React from 'react'
import classnames from 'classnames'
import {Link, useLocation} from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'

import {useFlags} from 'launchdarkly-react-client-sdk'
import css from 'assets/css/navbar.less'

import {hasRole} from 'utils'
import {ADMIN_ROLE, AGENT_ROLE} from 'config/user'
import {UserRole} from 'config/types/user'
import {FeatureFlagKey} from 'config/featureFlags'
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
    requiredFeatureFlag?: FeatureFlagKey
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
                to: 'integrations/mine',
                text: 'My Apps',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'integrations',
                text: 'All Apps',
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
                requiredFeatureFlag: FeatureFlagKey.TicketFields,
                to: 'ticket-fields',
                text: 'Ticket fields',
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
    const featureFlags = useFlags()
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        featureFlags[FeatureFlagKey.AutomationSettingsRevamp]
    const isAppStoreEnabled: boolean | undefined =
        featureFlags[FeatureFlagKey.AppStore]

    const getCategories = () => {
        if (isAutomationSettingsRevampEnabled) {
            const automationIndex = CATEGORIES.findIndex(
                (category) => category.name === 'Automation'
            )

            if (automationIndex !== -1) {
                const categories = [...CATEGORIES]

                categories.splice(automationIndex, 1)

                return categories
            }
        }
        if (!isAppStoreEnabled) {
            const integrationIndex = CATEGORIES.findIndex(
                (category) => category.name === 'App Store'
            )
            const categories = cloneDeep(CATEGORIES)
            const links = categories[integrationIndex].links
            links.splice(0, 2)
            links.unshift({
                requiredRole: ADMIN_ROLE,
                to: 'integrations',
                text: 'Apps & integrations',
            })

            return categories
        }

        return CATEGORIES
    }

    return (
        <Navbar activeContent="settings">
            {getCategories().map(({name, icon, links}, index) => {
                const displayedLinks = links
                    .filter((link) => !link.isHidden)
                    .map(({to, text, requiredRole, requiredFeatureFlag}) => {
                        let computedText = text
                        if (
                            (requiredRole &&
                                !hasRole(currentUser, requiredRole)) ||
                            (requiredFeatureFlag &&
                                !featureFlags[requiredFeatureFlag])
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

                        if (
                            isActive &&
                            pathname.includes('integrations/mine') &&
                            to.match(/.*integrations(\/)?$/)
                        ) {
                            isActive = false
                        }

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
                                    logEvent(
                                        SegmentEvent.SettingsNavigationClicked,
                                        {
                                            title: text,
                                            account_domain:
                                                account.get('domain'),
                                        }
                                    )
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
