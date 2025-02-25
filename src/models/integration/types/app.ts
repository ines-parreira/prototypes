import type { IntegrationConfig } from 'config'
import type { IntegrationListItem } from 'state/integrations/types'

import type { Integration } from '.'
import { IntegrationType } from '../constants'
import type { IntegrationBase } from './base'

export type AppIntegration = IntegrationBase & {
    type: IntegrationType.App
    application_id: string
    meta: AppIntegrationMeta
}

export type AppIntegrationMeta = {
    address: string
}

export enum Category {
    FEATURED = 'Featured',
    CHAT = 'Chat',
    PHONE = 'Phone',
    SMS = 'SMS',
    SOCIAL = 'Social Media',
    ECOMMERCE = 'Ecommerce',
    SUBSCRIPTIONS = 'Subscriptions',
    SHIPPING = 'Shipping & Fulfillment',
    RETURNS = 'Returns & Exchanges',
    LOYALTY = 'Loyalty & Retention',
    REVIEWS = 'Reviews & UGC',
    MARKETING = 'Marketing',
    ANALYTICS = 'BI & Analytics',
    DATA = 'Data Management',
    QUALITY = 'Quality Assurance',
}

export const isAppIntegration = (
    integration: Maybe<Integration>,
): integration is AppIntegration => integration?.type === IntegrationType.App

export const isCategory = (
    potentialCategory: Maybe<string>,
): potentialCategory is Category =>
    Object.values<string>(Category).includes(potentialCategory || '')

export enum PricingPlan {
    FREE = 'Free',
    RECURRING = 'Recurring Subscription',
    ONE_TIME = 'One-time Fee',
}

export enum TrialPeriod {
    SEVEN = '7 days',
    FOURTEEN = '14 days',
    THIRTY = '30 days',
    CUSTOM = 'Custom period',
}

export type AppListData = {
    id: string
    name: string
    headline: string
    categories: Category[]
    app_icon: string
    is_featured: boolean
    is_installed: boolean
}

export type AppData = AppListData & {
    granted_scopes?: string[]
    is_unapproved: boolean
    description: string
    benefits: string[]
    app_url: string
    company: string
    company_url: string
    screenshots: string[]
    privacy_policy: string
    setup_guide: string
    pricing_plan: PricingPlan | null
    pricing_link: string
    pricing_details: string
    has_free_trial: boolean
    free_trial_period: TrialPeriod
    support_email: string
    support_phone: string
    alloy_integration_id?: string
}

export type AppListItem = IntegrationListItem & {
    type: IntegrationType.App
    appId: AppListData['id']
    isConnected: AppListData['is_installed']
    image: AppListData['app_icon']
}

export type AppDetail = Omit<IntegrationConfig, 'isExternalConnectUrl'> & {
    type: IntegrationType.App
    isConnected: AppListData['is_installed']
    grantedScopes: AppData['granted_scopes']
    appId: AppListData['id']
    image: AppListData['app_icon']
    isUnapproved: AppData['is_unapproved']
    connectUrl: AppData['app_url']
    hasFreeTrial: AppData['has_free_trial']
    freeTrialPeriod: AppData['free_trial_period']
    supportEmail: AppData['support_email']
    supportPhone: AppData['support_phone']
    alloyIntegrationId?: AppData['alloy_integration_id']
}

export type DisconnectResponse = {
    is_uninstalled: boolean
}

export type AppErrorLog = {
    error: string
    payload: any
    created_datetime: string
}

export const isAppListItem = (
    input: IntegrationListItem | AppListItem,
): input is AppListItem => input.type === IntegrationType.App

export const isAppDetail = (
    input: Record<string, unknown>,
): input is AppDetail =>
    input?.type === IntegrationType.App && typeof input?.appId === 'string'
