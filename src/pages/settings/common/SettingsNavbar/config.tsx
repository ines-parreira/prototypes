import React from 'react'

import {ADMIN_ROLE, AGENT_ROLE} from 'config/user'
import {FeatureFlagKey} from 'config/featureFlags'
import {IntegrationType} from 'models/integration/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {CONTACT_FORM_PAGE_TITLE} from 'pages/settings/contactForm/constants'
import css from 'assets/css/navbar.less'

import {Category} from './types'

export const NavbarConfig: Category[] = [
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
                to: 'customer-fields',
                text: 'Customer Fields',
                requiredFeatureFlags: [FeatureFlagKey.CustomerFields],
            },
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
                extra: (
                    <Badge type={ColorType.Blue} className={css.badge}>
                        NEW
                    </Badge>
                ),
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
