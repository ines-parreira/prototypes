// g/integrations/gmail/schemas.py
import {IntegrationType} from '../constants'
import type {EmailIntegrationMeta} from './email'
import type {IntegrationBase} from './base'
import type {OAuth2} from './misc'
import type {Integration} from './'

export type GmailIntegration = IntegrationBase & {
    type: IntegrationType.Gmail
    meta: GmailIntegrationMeta
}

export type GmailIntegrationMeta = EmailIntegrationMeta & {
    import_activated: boolean
    use_gmail_categories: boolean
    enable_gmail_sending: boolean
    enable_gmail_threading: boolean
    importation: Record<string, unknown>
    sync: Record<string, unknown>
    full_sync?: Maybe<Record<string, unknown>>
    oauth: OAuth2
    use_new_creds_version: boolean
}

export const isGmailIntegration = (
    integration: Maybe<Integration>
): integration is GmailIntegration =>
    integration?.type === IntegrationType.Gmail
