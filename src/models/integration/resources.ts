import {
    ApiListResponse,
    ApiListResponseCursorPagination,
    ApiPaginationParams,
} from 'models/api/types'
import client from 'models/api/resources'

import {
    AppListData,
    AppData,
    AppDetail,
    AppErrorLog,
    AppListItem,
    DisconnectResponse,
    Category,
} from './types/app'
import {Integration, IntegrationRequest, IntegrationType} from './types'

export const appListDataToAppListMapper = (data: AppListData): AppListItem => {
    const categories = data.categories || []
    if (data.is_featured) categories.push(Category.FEATURED)
    return {
        type: IntegrationType.App,
        appId: data.id,
        isConnected: data.is_installed,
        title: data.name,
        description: data.headline,
        categories,
        image: data.app_icon,
        count: 0,
    }
}

export const appDataToAppDetailMapper = (data: AppData): AppDetail => ({
    type: IntegrationType.App,
    isUnapproved: data.is_unapproved,
    title: data.name,
    appId: data.id,
    isConnected: data.is_installed,
    grantedScopes: data.granted_scopes,
    description: data.headline,
    longDescription: data.description,
    benefits: data.benefits,
    image: data.app_icon,
    connectUrl: data.app_url,
    categories: data.categories,
    company: {name: data.company, url: data.company_url},
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
    alloyIntegrationId: data.alloy_integration_id,
})

export const fetchApps = async (): Promise<AppListItem[]> => {
    const response = await client.get<ApiListResponse<AppListData[], never>>(
        '/api/apps/'
    )
    return (response.data?.data || []).map(appListDataToAppListMapper)
}

export const fetchInstalledApps = async (): Promise<AppListItem[]> => {
    const response = await client.get<ApiListResponse<AppListData[], never>>(
        '/api/apps/installed/'
    )
    return (response.data?.data || []).map(appListDataToAppListMapper)
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

export const fetchIntegrations = async (params: ApiPaginationParams = {}) =>
    await client.get<ApiListResponseCursorPagination<Integration[]>>(
        '/api/integrations',
        {
            params,
        }
    )

export const requestNewIntegration = async (payload: IntegrationRequest) => {
    const {data} = await client.post<IntegrationRequest>(
        '/integrations/request',
        payload
    )
    return data
}
