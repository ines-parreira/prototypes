import {flatMap} from 'lodash'
import React, {ReactNode} from 'react'
import classnames from 'classnames'
import {useLocation} from 'react-router-dom'
import _kebabCase from 'lodash/kebabCase'

import {useFlags} from 'launchdarkly-react-client-sdk'
import css from 'assets/css/navbar.less'

import {logEvent, SegmentEvent} from 'common/segment'
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
import Navbar from 'pages/common/components/Navbar'

import {CONTACT_FORM_PAGE_TITLE} from '../contactForm/constants'
import {buildPasswordAnd2FaText} from '../yourProfile/twoFactorAuthentication/utils'
import SettingsNavbarLink from './SettingsNavbarLink'

export type CategoryLink = {
    className?: string
    requiredRole?: UserRole
    requiredFeatureFlags?: FeatureFlagKey[]
    text: string
    to: string
    extra?: ReactNode
    outerExtra?: ReactNode
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
            {
                requiredRole: ADMIN_ROLE,
                to: 'contact-form',
                text: CONTACT_FORM_PAGE_TITLE,
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
                text: 'My apps',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'integrations',
                text: 'All apps',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: `integrations/${IntegrationType.Http}`,
                text: 'HTTP integration',
            },
        ],
    },
    {
        name: 'Productivity',
        icon: 'speed',
        links: [
            {
                requiredRole: ADMIN_ROLE,
                to: 'ticket-fields',
                text: 'Ticket Fields',
            },
            {
                requiredRole: AGENT_ROLE,
                to: 'manage-tags',
                text: 'Tags',
            },
            {
                requiredRole: AGENT_ROLE,
                to: 'rules',
                text: 'Rules',
            },
            {
                to: 'macros',
                text: 'Macros',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'auto-merge',
                text: 'Auto-merge',
            },
            {
                requiredRole: AGENT_ROLE,
                to: 'sla',
                text: 'SLAs',
                requiredFeatureFlags: [FeatureFlagKey.SLAPolicies],
            },
        ],
    },
    {
        name: 'Convert',
        icon: 'paid',
        links: [],
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
            {
                requiredRole: ADMIN_ROLE,
                to: 'ticket-assignment',
                text: 'Ticket assignment',
            },
        ],
    },
    {
        name: 'Account',
        icon: 'business_center',
        links: [
            {
                requiredRole: ADMIN_ROLE,
                to: 'sidebar',
                text: 'Sidebar',
            },
            {
                requiredRole: ADMIN_ROLE,
                to: 'phone-numbers',
                text: 'Phone numbers',
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
                to: 'notifications',
                text: 'Notifications',
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
    const isDecoupleContactFormEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.DecoupleContactForm]

    const categoriesInUse = React.useMemo<Category[]>(() => {
        return flatMap(CATEGORIES, (category) => {
            if (!isDecoupleContactFormEnabled && category.name === 'Channels') {
                return [
                    {
                        ...category,
                        links: category.links.filter(
                            ({text}) => text !== CONTACT_FORM_PAGE_TITLE
                        ),
                    },
                ]
            }

            return [category]
        })
    }, [isDecoupleContactFormEnabled])

    return (
        <Navbar activeContent="settings">
            {categoriesInUse.map(({name, icon, links}, index) => {
                const displayedLinks = links
                    .filter((link) => !link.isHidden)
                    .map(
                        ({
                            to,
                            text,
                            requiredRole,
                            requiredFeatureFlags,
                            extra,
                            outerExtra,
                        }) => {
                            let computedText = text
                            if (
                                (requiredRole &&
                                    !hasRole(currentUser, requiredRole)) ||
                                (requiredFeatureFlags &&
                                    !requiredFeatureFlags.every(
                                        (flag) => featureFlags[flag]
                                    ))
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
                                <div
                                    key={to}
                                    className={classnames(
                                        css['link-wrapper'],
                                        css.isNested
                                    )}
                                    data-candu-id={`settings-link-${_kebabCase(
                                        computedText
                                    )}`}
                                >
                                    <SettingsNavbarLink
                                        to={to}
                                        isActive={isActive}
                                        computedText={computedText}
                                        extra={extra}
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
                                    />
                                    {outerExtra}
                                </div>
                            )
                        }
                    )
                    .filter((link) => link)

                // Hide the category if there's nothing to display
                if (!displayedLinks.length) {
                    return null
                }

                return (
                    <div
                        className={css.category}
                        key={index}
                        data-candu-id={`settings-category-${_kebabCase(name)}`}
                    >
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
