// g/integrations/yotpo/schemas.py
import {IntegrationType} from '../constants'
import type {Integration} from './'
import type {IntegrationBase} from './base'
import type {OAuth2} from './misc'

export type YotpoIntegration = IntegrationBase & {
    type: IntegrationType.Yotpo
    meta: YotpoIntegrationMeta
}

export type YotpoIntegrationMeta = {
    oauth: OAuth2
    import_state?: {
        is_over?: boolean
        oldest_created_at?: string
    }
    yotpo_account_id: string
}

export const isYotpoIntegration = (
    integration: Maybe<Integration>
): integration is YotpoIntegration =>
    integration?.type === IntegrationType.Yotpo
