import {Map} from 'immutable'

import {IntegrationConfig} from 'config'
import {
    Integration,
    IntegrationAuthentication,
    IntegrationType,
} from '../../models/integration/types'

export type IntegrationsImmutableState = Map<any, any>

export type IntegrationsState = {
    integrations: Integration[]
    authentication: Partial<{
        [K in IntegrationType]: IntegrationAuthentication<K>
    }>
    state: {
        loading: {
            integration?: boolean
            integrations?: boolean
            emailDomain?: boolean
            updateIntegration?: boolean
            testing?: boolean
            delete?: boolean
            chatStatus?: {
                [key: number]: boolean
            }
        }
        error: {
            chatStatus?: {
                [key: number]: boolean
            }
        }
    }
}

export type IntegrationListItem = Pick<
    IntegrationConfig,
    'type' | 'description' | 'title' | 'requiredFeature' | 'image'
> & {
    count: number
    requiredPlanName?: string
}
