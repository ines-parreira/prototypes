// g/integrations/outlook/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {EmailSignature} from './email'
import {OAuth2} from './misc'

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
    import_state: {
        enabled?: boolean
        is_over?: boolean
        next_page_link: Maybe<string>
        oldest_created_at?: string
        count?: number
        ticket_count?: number
    }
    signature?: EmailSignature
}

export const isOutlookIntegration = createTypeGuard<
    Maybe<Integration>,
    OutlookIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Outlook ? input : undefined
)
