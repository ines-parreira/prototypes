// g/integrations/sms/schemas.py

import {createTypeGuard} from 'utils'
import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

export type WhatsAppIntegration = IntegrationBase & {
    type: IntegrationType.WhatsApp
    meta: WhatsAppIntegrationMeta
}

export type WhatsAppIntegrationMeta = {
    emoji?: string
    phone_number_id: number
    routing: {
        phone_number: string
    }
}

export const isWhatsAppIntegration = createTypeGuard<
    Maybe<Integration>,
    WhatsAppIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.WhatsApp ? input : undefined
)
