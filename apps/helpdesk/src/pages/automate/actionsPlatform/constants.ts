import type { ActionsApp } from './types'

export const AUTH_TYPE_LABEL_BY_TYPE: Record<ActionsApp['auth_type'], string> =
    {
        'api-key': 'API key',
        'oauth2-token': 'OAuth2 refresh token',
        trackstar: 'Trackstar',
    }

export const DISABLED_AUTH_TYPES: ActionsApp['auth_type'][] = []

export const CATEGORIES = [
    'Orders',
    'Subscriptions',
    'Returns & Exchanges',
] as const
