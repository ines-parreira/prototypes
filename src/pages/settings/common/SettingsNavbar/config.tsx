import React from 'react'

import { Badge } from '@gorgias/merchant-ui-kit'

import cssNavbar from 'assets/css/navbar.less'
import { FeatureFlagKey } from 'config/featureFlags'
import { ADMIN_ROLE, AGENT_ROLE } from 'config/user'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { IntegrationType } from 'models/integration/types'
import { CONTACT_FORM_PAGE_TITLE } from 'pages/settings/contactForm/constants'
import {
    CUSTOM_FIELD_CONDITIONS_ROUTE,
    CUSTOM_FIELD_ROUTES,
} from 'routes/constants'

import { Category } from './types'

const productivitySection: Category = {
    name: 'Productivity',
    icon: 'speed',
    links: [
        {
            requiredRole: ADMIN_ROLE,
            to: CUSTOM_FIELD_ROUTES[OBJECT_TYPES.CUSTOMER],
            text: 'Customer Fields',
            extra: (
                <Badge type={'blue'} className={cssNavbar.badge}>
                    BETA
                </Badge>
            ),
        },
        {
            requiredRole: ADMIN_ROLE,
            to: CUSTOM_FIELD_ROUTES[OBJECT_TYPES.TICKET],
            text: 'Ticket Fields',
        },
        {
            requiredRole: ADMIN_ROLE,
            to: CUSTOM_FIELD_CONDITIONS_ROUTE,
            text: 'Field Conditions',
            requiredFeatureFlags: [FeatureFlagKey.TicketConditionalFields],
            extra: (
                <Badge type={'blue'} className={cssNavbar.badge}>
                    BETA
                </Badge>
            ),
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
        },
        {
            requiredRole: AGENT_ROLE,
            requiredFeatureFlags: [FeatureFlagKey.AutomateSettingsRevamp],
            to: 'flows',
            text: 'Flows',
        },
        {
            requiredRole: AGENT_ROLE,
            requiredFeatureFlags: [FeatureFlagKey.AutomateSettingsRevamp],
            to: 'order-management',
            text: 'Order management',
        },
        {
            requiredRole: AGENT_ROLE,
            requiredFeatureFlags: [FeatureFlagKey.AutomateSettingsRevamp],
            to: 'article-recommendations',
            text: 'Article recommendations',
        },
    ],
}

export const NavbarConfig: Category[] = [
    {
        ...productivitySection,
        shouldRender: (flags) => !!flags[FeatureFlagKey.AutomateSettingsRevamp],
    },
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
        ...productivitySection,
        shouldRender: (flags) => !flags[FeatureFlagKey.AutomateSettingsRevamp],
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
