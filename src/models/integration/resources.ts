import {ApiListResponse} from 'models/api/types'
import client from 'models/api/resources'

import {
    AppListData,
    AppData,
    AppDetail,
    AppErrorLog,
    AppListItem,
    DisconnectResponse,
} from './types/app'
import {IntegrationType} from './types'

export const appDataToAppDetailMapper = (data: AppData): AppDetail => ({
    type: IntegrationType.App,
    isUnapproved: data.is_unapproved,
    title: data.name,
    appId: data.id,
    isConnected: data.is_installed,
    description: data.headline,
    longDescription: data.description,
    image: data.app_icon,
    connectUrl: data.app_url,
    categories: data.categories,
    company: data.company,
    companyUrl: data.company_url,
    screenshots: data.screenshots,
    privacyPolicy: data.privacy_policy,
    setupGuide: data.setup_guide,
    pricingPlan: data.pricing_plan,
    pricingDetails: data.pricing_details,
    pricingLink: data.pricing_link,
    hasFreeTrial: data.has_free_trial,
    freeTrialPeriod: data.free_trial_period,
    supportEmail: data.support_email,
    supportPhone: data.support_phone,
})

export const fetchApps = async (): Promise<AppListItem[]> => {
    const response = await client.get<ApiListResponse<AppListData[], never>>(
        '/api/apps/'
    )
    return (response.data?.data || []).map((app): AppListItem => {
        return {
            type: IntegrationType.App,
            appId: app.id,
            isConnected: app.is_installed,
            title: app.name,
            description: app.headline,
            image: app.app_icon,
        }
    })
}

export const fetchApp = async (
    appId: string,
    preview?: boolean
): Promise<AppDetail> => {
    const params = {preview}
    const {data} = await client.get<AppData>(`/api/apps/${appId}`, {params})
    return appDataToAppDetailMapper(data)
}

export const disconnectApp = async (appId: string): Promise<boolean> => {
    const {data} = await client.get<DisconnectResponse>(
        `/api/apps/uninstall/${appId}`
    )
    return data.is_uninstalled
}

export const fetchAppErrorLogs = async (
    appId: string
): Promise<AppErrorLog[]> => {
    const {data} = await client.get<ApiListResponse<AppErrorLog[], never>>(
        '/api/async/errors',
        {params: {app_id: appId}}
    )
    return data.data
}
