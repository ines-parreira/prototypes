// g/integrations/recharge/schemas.py

import {createTypeGuard} from '../../../utils'
import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2} from './misc'

import type {Integration} from './'

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

export const isRechargeIntegration = createTypeGuard<
    Maybe<Integration>,
    RechargeIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Recharge ? input : undefined
)
