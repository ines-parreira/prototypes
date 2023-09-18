// g/integrations/smooch/schemas.py
import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'
import type {OAuth2, AutoResponder} from './misc'
import type {Integration} from './'

export type SmoochIntegration = IntegrationBase & {
    type: IntegrationType.Smooch
    meta: SmoochIntegrationMeta
}

export type SmoochIntegrationMeta = {
    oauth: OAuth2
    need_scope_update?: boolean
    app_id?: string
    app_token?: string
    webhook?: {
        id?: string
        secret?: string
        callback_url?: string
    }
    preferences?: {
        auto_responder?: AutoResponder
    }
    language: string
}

export const isSmoochIntegration = (
    integration: Maybe<Integration>
): integration is SmoochIntegration =>
    integration?.type === IntegrationType.Smooch
