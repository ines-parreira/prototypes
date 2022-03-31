import {ApiListResponse} from 'models/api/types'
import client from 'models/api/resources'

import {AppBase, AppListItem} from './types/app'
import {IntegrationType} from './types'

export const fetchApps = async (): Promise<AppListItem[]> => {
    const response = await client.get<ApiListResponse<AppBase[], never>>(
        '/api/apps/'
    )
    return (response.data?.data || []).map((app): AppListItem => {
        return {
            type: IntegrationType.App,
            title: app.name,
            description: app.headline,
            url: app.app_url,
            image: app.app_icon,
            count: 0,
        }
    })
}
