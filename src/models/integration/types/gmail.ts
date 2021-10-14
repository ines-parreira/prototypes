// g/integrations/gmail/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {EmailIntegrationMeta} from './email'
import {IntegrationBase} from './base'
import {OAuth2} from './misc'

import type {Integration} from './'

export type GmailIntegration = IntegrationBase & {
    type: IntegrationType.Gmail
    meta: GmailIntegrationMeta
}

export type GmailIntegrationMeta = EmailIntegrationMeta & {
    import_activated: boolean
    use_gmail_categories: boolean
    enable_gmail_sending: boolean
    importation: Record<string, unknown>
    sync: Record<string, unknown>
    full_sync?: Maybe<Record<string, unknown>>
    oauth: OAuth2
    use_new_creds_version: boolean
}

export const isGmailIntegration = createTypeGuard<
    Maybe<Integration>,
    GmailIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Gmail ? input : undefined
)
