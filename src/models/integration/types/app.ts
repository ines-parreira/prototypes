import {IntegrationConfig} from 'config'
import {IntegrationListItem} from 'state/integrations/types'
import {IntegrationType} from '../constants'

export enum Category {
    SMS_EMAIL = 'SMS and Email',
    ECOM = 'Ecomm Platforms',
    PHONE = 'Phone',
    REVIEWS = 'Reviews & UGC',
    LOYALTY = 'Loyalty & Retention',
    RETURNS = 'Returns & Exchanges',
    SHIPPING = 'Shipping & Fulfillment',
    PAYMENT = 'Payment, Billing & Subscription',
    SOCIAL = 'Social Media',
    ANALYTICS = 'BI & Analytics',
    ERP = 'ERP and Accounting',
    DATA = 'Data Management',
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
    app_icon: string
}

export type AppData = AppListData & {
    description: string
    app_url: string
    categories: Category[]
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

export type AppListItem = IntegrationListItem & {
    type: IntegrationType.App
    appId: AppListData['id']
    image: AppListData['app_icon']
}

export type AppDetail = Omit<IntegrationConfig, 'isExternalConnectUrl'> & {
    type: IntegrationType.App
    image: AppListData['app_icon']
    connectUrl: AppData['app_url']
    supportEmail: AppData['support_email']
    supportPhone: AppData['support_phone']
}

export const isAppListItem = (
    input: IntegrationListItem | AppListItem
): input is AppListItem => input.type === IntegrationType.App

export const isAppDetail = (
    input: AppDetail | IntegrationConfig
): input is AppDetail => input.type === IntegrationType.App
