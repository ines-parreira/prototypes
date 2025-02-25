// g/integrations/sms/schemas.py
import { IntegrationType } from '../constants'
import type { Integration } from './'
import type { IntegrationBase } from './base'

export type SmsIntegration = IntegrationBase & {
    type: IntegrationType.Sms
    meta: SmsIntegrationMeta
}

export type SmsIntegrationMeta = {
    emoji: string
    phone_number_id: number
}

export const isSmsIntegration = (
    integration: Maybe<Integration>,
): integration is SmsIntegration => integration?.type === IntegrationType.Sms
