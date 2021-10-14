// g/integrations/facebook/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'
import {OAuth2, AutoResponder} from './misc'

import type {Integration} from './'

export type FacebookIntegration = IntegrationBase & {
    type: IntegrationType.Facebook
    meta: FacebookIntegrationMeta
}

export type FacebookIntegrationMeta = {
    oauth: Maybe<OAuth2>
    roles: string
    can_be_onboarded: boolean
    preferences: FacebokIntegrationPreferences
    page_id: string
    name: string
    language: string
    about: Maybe<string>
    category: Maybe<string>
    settings: FacebookIntegrationSettings
    shopify_integration_ids: number[]
    history_sync: Maybe<{
        posts: {
            is_synchronized: boolean
            oldest_time_synced: string
            nb_of_tickets_created: number
        }
        oldest_syncable?: string
        is_synchronized: boolean
    }>
    picture: Maybe<{
        data: {
            width: Maybe<number>
            height: Maybe<number>
            is_silhouette: boolean
            url: Maybe<string>
        }
    }>
    instagram: Maybe<{
        id: string
        name: Maybe<string>
        username: string
        actor_ids: Maybe<string[]>
        followers_count: Maybe<number>
        instagram_direct_message_allowed: Maybe<boolean>
    }>
}

export type FacebookIntegrationSettings = {
    messenger_enabled: boolean
    posts_enabled: boolean
    mentions_enabled: boolean
    import_history_enabled: boolean
    instagram_comments_enabled: boolean
    instagram_mentions_enabled: boolean
    instagram_ads_enabled: boolean
    recommendations_enabled: boolean
    instagram_direct_message_enabled: boolean
}

export type FacebokIntegrationPreferences = {
    auto_responder?: AutoResponder
}

export const isFacebookIntegration = createTypeGuard<
    Maybe<Integration>,
    FacebookIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Facebook ? input : undefined
)
