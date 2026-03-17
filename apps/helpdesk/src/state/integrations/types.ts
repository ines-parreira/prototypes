import type { Map } from 'immutable'

import type { IntegrationConfig } from 'config'

import type {
    EmailDomain,
    EmailMigrationBannerStatus,
    EmailMigrationInboundVerification,
    Integration,
    IntegrationAuthentication,
    IntegrationType,
} from '../../models/integration/types'
import type { IntegrationBase } from '../../models/integration/types/base'

export type IntegrationsImmutableState = Map<any, any>

export type IntegrationsState = {
    integrations: Integration[]
    integration?: Integration
    authentication: Partial<{
        [K in IntegrationType]: IntegrationAuthentication<K>
    }>
    state: {
        loading: {
            integration?: boolean
            integrations?: boolean
            emailDomain?: boolean
            updateIntegration?: IntegrationBase['id']
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
    emailDomain?: EmailDomain
    emailMigrationBannerStatus?: EmailMigrationBannerStatus
    migrations?: {
        email?: EmailMigrationInboundVerification[]
    }
    extra?: {
        [IntegrationType.GorgiasChat]: {
            shopifyCheckoutChatBannerVisible?: boolean
        }
    }
}

export type IntegrationListItem = Pick<
    IntegrationConfig,
    | 'type'
    | 'description'
    | 'title'
    | 'requiredFeature'
    | 'image'
    | 'categories'
> & {
    count: number
    requiredPriceName?: string
}
