// g/integrations/outlook/schemas.py
import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'
import type {EmailSignature} from './email'
import type {OAuth2} from './misc'
import {
    OutboundVerificationStatusValue,
    OutboundVerificationType,
} from './email'
import type {Integration} from './'

export type OutlookIntegration = IntegrationBase & {
    type: IntegrationType.Outlook
    meta: OutlookIntegrationMeta
}

export type OutlookIntegrationMeta = {
    address: string
    outlook_user_id: string
    subscription: {
        id: string
        expiration_datetime: string
    }
    oauth: OAuth2
    provider: string
    import_state: {
        enabled?: boolean
        is_over?: boolean
        next_page_link: Maybe<string>
        oldest_created_at?: string
        count?: number
        ticket_count?: number
    }
    signature?: EmailSignature
    enable_outlook_sending: boolean
    outbound_verification_status?: {
        [OutboundVerificationType.Domain]: OutboundVerificationStatusValue
    }
}

export const isOutlookIntegration = (
    integration: Maybe<Integration>
): integration is OutlookIntegration =>
    integration?.type === IntegrationType.Outlook
