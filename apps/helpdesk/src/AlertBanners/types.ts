import type { ComponentProps, HTMLProps } from 'react'

import type { Link } from 'react-router-dom'

import type { AlertBannerProps } from './components/AlertBanner'

export enum AlertBannerTypes {
    Critical = 'critical',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

// AlertBanner CTA types
type baseCTAType = {
    text: string
    onClick?: () => void
}

type ExternalCTAType = baseCTAType & {
    type: 'external'
    opensInNewTab?: boolean
} & Required<Pick<HTMLProps<HTMLAnchorElement>, 'href'>>

type InternalCTAType = baseCTAType & {
    type: 'internal'
    opensInNewTab?: boolean
} & Pick<ComponentProps<typeof Link>, 'to'>

type ButtonCTAType = baseCTAType & {
    type: 'action'
    onClick: () => void
}

export type AlertBannerCTATypes =
    | ExternalCTAType
    | InternalCTAType
    | ButtonCTAType

// BannerContext types
export type ContextBanner = AlertBannerProps & {
    category: BannerCategory
    instanceId: string
    preventDismiss?: boolean
}

export const BannerCategories = {
    ACCOUNT_NOT_VERIFIED: 'account_not_verified',
    ACCOUNT_USAGE: 'account_usage',
    AI_SHOPPING_ASSISTANT_TRIAL: 'ai_shopping_assistant_trial',
    AI_SHOPPING_ASSISTANT_TRIAL_REVAMP: 'ai_shopping_assistant_trial_revamp',
    AI_AGENT_TRIAL: 'ai_agent_trial',
    BILLING: 'billing',
    BILLING_ADDRESS_VALIDATION: 'billing_address_validation',
    EMAIL_DISCONNECTED: 'email_disconnected',
    EMAIL_DOMAIN_VERIFICATION: 'email_domain_verification',
    EMAIL_MIGRATION_BANNER: 'email_migration_banner',
    ERROR_HANDLING: 'error_handling',
    ERROR_HANDLING_PHONE: 'error_handling_phone',
    IMPERSONATION: 'impersonation',
    PAYMENT_ENABLED: 'payment_enabled',
    REALTIME_CONNECTIVITY: 'realtime_connectivity',
    STATUS_PAGE_INCIDENT: 'status_page_incident',
    STATUS_PAGE_MAINTENANCE: 'status_page_maintenance',
    TMP_AI_AGENT_MOVED: 'ai_agent_moved',
    TRACKING_BUNDLE_INSTALLATION_WARNING:
        'tracking_bundle_installation_warning',
    TWO_FA_REQUIRED_NOTIFICATION_ID: 'two_fa_required_notification_id',
    SCRIPT_TAG_MIGRATION: 'script_tag_migration',
    SUBSCRIPTION: 'subscription',
    SHOPIFY_INVENTORY_SCOPE: 'shopify_inventory_scope',
    USAGE_BANNER: 'usage_banner',
    ZENDESK_IMPORT_FAILURE_BANNER: 'zendesk_import_failure_banner',
} as const

export type BannerCategory =
    (typeof BannerCategories)[keyof typeof BannerCategories]
