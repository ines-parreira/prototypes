import {IntegrationConfig} from 'config'
import {IntegrationListItem} from 'state/integrations/types'
import {IntegrationType} from '../constants'

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
}

export type AppListItem = Omit<IntegrationListItem, 'count'> & {
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
    supportEmail: AppData['support_email']
    supportPhone: AppData['support_phone']
    connectTitle?: string
    icon?: string
    otherResources?: {
        title: string
        icon: string
        url: string
    }[]
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
    input: IntegrationListItem | AppListItem
): input is AppListItem => input.type === IntegrationType.App

export const isAppDetail = (
    input: AppDetail | IntegrationConfig
): input is AppDetail => input.type === IntegrationType.App
