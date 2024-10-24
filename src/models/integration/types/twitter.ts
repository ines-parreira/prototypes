// g/integrations/twitter/schemas.py
import {IntegrationType} from '../constants'

import type {Integration} from './'
import type {IntegrationBase} from './base'
import type {OAuth2} from './misc'

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

export const isTwitterIntegration = (
    integration: Maybe<Integration>
): integration is TwitterIntegration =>
    integration?.type === IntegrationType.Twitter
