import type { ActionsApp } from './types'

export const AUTH_TYPE_LABEL_BY_TYPE: Record<ActionsApp['auth_type'], string> =
    {
        'api-key': 'API key',
        'oauth2-token': 'OAuth2 refresh token',
        trackstar: 'Trackstar',
    }

export const DISABLED_AUTH_TYPES: ActionsApp['auth_type'][] = []

export enum CATEGORIES {
    ORDERS = 'Orders',
    RETURNS_AND_EXCHANGES = 'Returns & Exchanges',
    SUBSCRIPTIONS = 'Subscriptions',
    MARKETING = 'Marketing',
}

export const CATEGORIES_VALUES = Object.values(CATEGORIES)

export const CATEGORIES_SORT_ORDER = [
    CATEGORIES.ORDERS,
    CATEGORIES.RETURNS_AND_EXCHANGES,
    CATEGORIES.SUBSCRIPTIONS,
    CATEGORIES.MARKETING,
] as const
