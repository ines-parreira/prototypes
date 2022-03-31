import {ApiListResponse} from 'models/api/types'
import client from 'models/api/resources'

import {AppListData, AppData, AppDetail, AppListItem} from './types/app'
import {IntegrationType} from './types'

export const appDataToAppDetailMapper = (data: AppData): AppDetail => ({
    type: IntegrationType.App,
    title: data.name,
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
            title: app.name,
            description: app.headline,
            image: app.app_icon,
            count: 0,
        }
    })
}

export const fetchApp = async (appId: string): Promise<AppDetail> => {
    const {data} = await client.get<AppData>(`/api/apps/${appId}`)
    return appDataToAppDetailMapper(data)
}
