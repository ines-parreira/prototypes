// g/integrations/twitter/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2} from './misc'

import type {Integration} from './'

export type TwitterIntegration = IntegrationBase & {
    type: IntegrationType.Twitter
    meta: TwitterIntegrationMeta
}

export type TwitterIntegrationMeta = {
    oauth: OAuth2
    twitter_user_id: string
    twitter_webhook_url_id: string
    about?: Maybe<string>
    picture?: Maybe<string>
    settings: {
        mentions_enabled: boolean
        tweets_replies_enabled: boolean
        direct_messages_enabled: boolean
    }
}

export const isTwitterIntegration = createTypeGuard<
    Maybe<Integration>,
    TwitterIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Twitter ? input : undefined
)
