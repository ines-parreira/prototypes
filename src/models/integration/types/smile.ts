// g/integrations/smile/schemas.py

import {IntegrationType} from '../constants'

import type {IntegrationBase} from './base'
import type {OAuth2} from './misc'

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

export const isSmileIntegration = (
    integration: Maybe<Integration>
): integration is SmileIntegration =>
    integration?.type === IntegrationType.Smile
