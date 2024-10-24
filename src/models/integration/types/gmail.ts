// g/integrations/gmail/schemas.py
import {IntegrationType} from '../constants'
import type {Integration} from './'
import type {IntegrationBase} from './base'
import type {EmailIntegrationMeta} from './email'
import {
    OutboundVerificationStatusValue,
    OutboundVerificationType,
} from './email'
import type {OAuth2} from './misc'

export type GmailIntegration = IntegrationBase & {
    type: IntegrationType.Gmail
    meta: GmailIntegrationMeta
}

export type GmailIntegrationMeta = EmailIntegrationMeta & {
    import_activated: boolean
    use_gmail_categories: boolean
    enable_gmail_sending: boolean
    enable_gmail_threading: boolean
    provider: string
    importation: Record<string, unknown>
    sync: Record<string, unknown>
    full_sync?: Maybe<Record<string, unknown>>
    oauth: OAuth2
    use_new_creds_version: boolean
    outbound_verification_status?: {
        [OutboundVerificationType.Domain]: OutboundVerificationStatusValue
    }
}

export const isGmailIntegration = (
    integration: Maybe<Integration>
): integration is GmailIntegration =>
    integration?.type === IntegrationType.Gmail
