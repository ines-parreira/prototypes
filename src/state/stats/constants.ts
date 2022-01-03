import {IntegrationType} from '../../models/integration/constants'

export const SET_STAT = 'SET_STAT'
export const SET_STATS_FILTERS = 'SET_STATS_FILTERS'
export const MERGE_STATS_FILTERS = 'MERGE_STATS_FILTERS'
export const RESET_STATS_FILTERS = 'RESET_STATS_FILTERS'

export const STATS_MESSAGING_INTEGRATIONS_TYPES = [
    IntegrationType.Email,
    IntegrationType.Gmail,
    IntegrationType.Outlook,
    IntegrationType.Aircall,
    IntegrationType.GorgiasChat,
    IntegrationType.Smooch,
    IntegrationType.SmoochInside,
    IntegrationType.Facebook,
    IntegrationType.Zendesk,
]

export const STATS_STORE_INTEGRATION_TYPES = [IntegrationType.Shopify]
