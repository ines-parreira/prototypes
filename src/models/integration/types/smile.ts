// g/integrations/smile/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2} from './misc'

import type {Integration} from './'

export type SmileIntegration = IntegrationBase & {
    type: IntegrationType.Smile
    meta: SmileIntegrationMeta
}

export type SmileIntegrationMeta = {
    oauth: OAuth2
    smile_account_id: string
    sync_state: {
        is_initialized?: boolean
        oldest_created_at?: string
    }
}

export const isSmileIntegration = createTypeGuard<
    Maybe<Integration>,
    SmileIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Smile ? input : undefined
)
