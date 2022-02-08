// g/integrations/sms/schemas.py

import {createTypeGuard} from 'utils'
import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

export type SmsIntegration = IntegrationBase & {
    type: IntegrationType.Sms
    meta: SmsIntegrationMeta
}

export type SmsIntegrationMeta = {
    emoji: string
    twilio_phone_number_id: number
}

export const isSmsIntegration = createTypeGuard<
    Maybe<Integration>,
    SmsIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Sms ? input : undefined
)
