import {IntegrationListItem} from 'state/integrations/types'
import {IntegrationType} from '../constants'

export type AppBase = {
    id: string
    name: string
    headline: string
    app_icon: string
    app_url: string
}

export type AppDetail = AppBase & {
    description: string
}

export type AppListItem = IntegrationListItem & {
    type: IntegrationType.App
    image: AppBase['app_icon']
    url: AppBase['app_url']
}

export const isApp = (
    input: IntegrationListItem | AppListItem
): input is AppListItem => input.type === IntegrationType.App
