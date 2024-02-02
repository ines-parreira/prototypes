import {Components} from '../rest_api/revenue_addon_api/client.generated'

export const convertStatusOk = {
    status: 'active',
    usage_status: 'ok',
    usage: 0,
    limit: 50,
    bundle_status: 'installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

export const convertStatusOkWarning = {
    ...convertStatusOk,
    last_warning_100_at: '2021-01-01T00:00:00.000Z',
    cycle_start: '2020-01-01T00:00:00.000Z',
    cycle_end: '2022-01-01T00:00:00.000Z',
    estimated_reach_date: '2020-04-01T00:00:00.000Z',
    auto_upgrade_enabled: false,
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

export const convertStatusOkWarningUpgrade = {
    ...convertStatusOkWarning,
    auto_upgrade_enabled: true,
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

export const convertStatusLimitReached = {
    status: 'active',
    usage_status: 'limit-reached',
    usage: 51,
    limit: 50,
    bundle_status: 'installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

export const convertStatusLimitReachedNotInstalled = {
    ...convertStatusLimitReached,
    bundle_status: 'not_installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

export const convertStatusNotInstalled = {
    status: 'active',
    usage_status: 'ok',
    usage: 0,
    limit: 50,
    bundle_status: 'not_installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema
