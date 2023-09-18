// g/integrations/sms/schemas.py
import {IntegrationType} from '../constants'
import type {IntegrationBase} from './base'
import type {Integration} from './'

export type SmsIntegration = IntegrationBase & {
    type: IntegrationType.Sms
    meta: SmsIntegrationMeta
}

export type SmsIntegrationMeta = {
    emoji: string
    phone_number_id: number
}

export const isSmsIntegration = (
    integration: Maybe<Integration>
): integration is SmsIntegration => integration?.type === IntegrationType.Sms
