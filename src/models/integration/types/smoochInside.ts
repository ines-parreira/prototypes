// g/integrations/smooch_inside/schemas.py
import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'
import type {AutoResponder} from './misc'
import type {Integration} from './'

export type SmoochInsideIntegration = IntegrationBase & {
    type: IntegrationType.SmoochInside
    meta: SmoochInsideIntegrationMeta
}

export type SmoochInsideIntegrationMeta = {
    shopify_integration_ids?: number[]
    script_url?: string
    campaigns?: SmoochInsideCampaign[]
    quick_replies?: {
        enabled?: boolean
        replies?: string[]
    }
    preferences?: {
        email_capture_enforcement: string
        auto_responder: AutoResponder
        linked_email_integration?: Maybe<number>
    }
    language: string
}

type SmoochInsideTrigger = {
    key?: string
    operator?: string
    value?: unknown
}

type SmoochInsideCampaign = {
    name?: string
    id?: string
    triggers: SmoochInsideTrigger[]
    message: SmoochInsideMessage
    deactivated_datetime?: Maybe<string>
}

type SmoochInsideMessage = {
    author?: {
        name?: string
        email?: string
        avatar_url?: string
    }
    text: string
    html: string
}

export const isSmoochInsideIntegration = (
    integration: Maybe<Integration>
): integration is SmoochInsideIntegration =>
    integration?.type === IntegrationType.SmoochInside
