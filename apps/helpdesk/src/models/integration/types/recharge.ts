// g/integrations/recharge/schemas.py
import { IntegrationType } from '../constants'
import type { Integration } from './'
import type { IntegrationBase } from './base'
import type { OAuth2 } from './misc'

export type RechargeIntegration = IntegrationBase & {
    type: IntegrationType.Recharge
    meta: RechargeIntegrationMeta
}

export type RechargeIntegrationMeta = {
    oauth: OAuth2
    store_name: string
    sync_state?: {
        is_initialized?: boolean
        page?: number
    }
    need_scope_update: boolean
}

export const isRechargeIntegration = (
    integration: Maybe<Integration>,
): integration is RechargeIntegration =>
    integration?.type === IntegrationType.Recharge
