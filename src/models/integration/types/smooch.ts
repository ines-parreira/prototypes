// g/integrations/smooch/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2, AutoResponder} from './misc'

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

export const isSmoochIntegration = createTypeGuard<
    Maybe<Integration>,
    SmoochIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Smooch ? input : undefined
)
