// g/integrations/yotpo/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2} from './misc'

import type {Integration} from './'

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

export const isYotpoIntegration = createTypeGuard<
    Maybe<Integration>,
    YotpoIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Yotpo ? input : undefined
)
