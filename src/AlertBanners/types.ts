import React from 'react'
import {Link} from 'react-router-dom'

import {AlertBannerProps} from './components/AlertBanner'

export enum AlertBannerTypes {
    Critical = 'critical',
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
} & Required<Pick<React.HTMLProps<HTMLAnchorElement>, 'href'>>

type InternalCTAType = baseCTAType & {
    type: 'internal'
    opensInNewTab?: boolean
} & Pick<React.ComponentProps<typeof Link>, 'to'>

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
    IMPERSONATION: 'impersonation',
    STATUS_PAGE_INCIDENT: 'status_page_incident',
    STATUS_PAGE_MAINTENANCE: 'status_page_maintenance',
} as const

export type BannerCategory =
    (typeof BannerCategories)[keyof typeof BannerCategories]
