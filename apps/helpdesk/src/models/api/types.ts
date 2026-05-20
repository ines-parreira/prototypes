import type { AxiosError } from 'axios'
import { isAxiosError } from 'axios'

import type { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

export enum ContentType {
    Json = 'application/json',
    Form = 'application/x-www-form-urlencoded',
}

export enum HttpMethod {
    Get = 'GET',
    Post = 'POST',
    Put = 'PUT',
    Patch = 'PATCH',
    Delete = 'DELETE',
}

export type ApiListResponse<T, Y> = {
    data: T
    meta: Y
    object: string
    uri: string
}

export type ApiListResponseCursorPagination<
    T,
    U = CursorPaginationMeta,
> = ApiListResponse<T, U>

export type ApiListResponseLegacyPagination<T> = ApiListResponse<
    T,
    LegacyPaginationMeta
>

export type LegacyPaginationMeta = {
    current_page: string
    item_count: number
    page: number
    per_page: number
    nb_pages: number
    next_page?: string
}

export type OrderParams<T extends string> = {
    orderBy?: `${T}:${OrderDirection}`
}

export enum OrderDirection {
    Asc = 'asc',
    Desc = 'desc',
}

export type OrderField<T extends object> = T[keyof T]

export const opposite = (direction: OrderDirection) =>
    direction === OrderDirection.Asc ? OrderDirection.Desc : OrderDirection.Asc

export enum MetaSortOptions {
    Relevance = 'relevance',
}

export type ApiPaginationParams = {
    limit?: number
    cursor?: string | null
    orderBy?: string
    orderDir?: OrderDirection
}

export type ApiPaginationParamsWithFilter = ApiPaginationParams & {
    filter?: string
}

export type GorgiasApiError<T = unknown> = Omit<AxiosError, 'response'> &
    Pick<
        Required<AxiosError<{ error: GorgiasApiResponseDataError<T> }>>,
        'response'
    >

export type GorgiasApiResponseDataError<T = unknown> = { msg: string; data: T }

const isGorgiasApiResponseDataError = (
    data: Record<string, unknown> | undefined,
): data is GorgiasApiResponseDataError => {
    const { error } = data || {}
    if (typeof error !== 'object' || !error || Array.isArray(error)) {
        return false
    }
    const { msg } = error as { msg: unknown }
    return typeof msg === 'string'
}

export const isGorgiasApiError = (
    error: unknown,
): error is GorgiasApiError<unknown> => {
    return (
        isAxiosError(error) &&
        isGorgiasApiResponseDataError(error.response?.data)
    )
}

/**
 * Machine-readable error code returned by the backend in `error.data.error_code`
 * when an account is at or over its active integration limit.
 *
 * Surfaces on:
 *   - POST /api/integrations (channel create)
 *   - PATCH /api/integrations/<id> (reactivation, when clearing deactivated_datetime)
 *   - POST /api/ecom/stores (consumed by partner apps, not this UI)
 *
 * Response shape (HTTP 422):
 *   { "error": { "msg": "...", "data": { "error_code": "integration_limit_reached", "limit": N, "current": M } } }
 */
export const INTEGRATION_LIMIT_REACHED_ERROR_CODE = 'integration_limit_reached'

export type IntegrationLimitReachedErrorData = {
    error_code: typeof INTEGRATION_LIMIT_REACHED_ERROR_CODE
    limit: number
    current: number
    /**
     * True when the merchant can self-serve a plan upgrade to raise the cap.
     * False for enterprise/legacy plans where the limit can only be raised by
     * Customer Success — the UI should surface a "Contact us" path instead.
     */
    upgradable: boolean
}

export type IntegrationLimitReachedApiError =
    GorgiasApiError<IntegrationLimitReachedErrorData>

export const isIntegrationLimitReachedError = (
    error: unknown,
): error is IntegrationLimitReachedApiError => {
    if (!isGorgiasApiError(error)) {
        return false
    }
    // `isGorgiasApiError` already guarantees the `response.data.error` shape.
    const data = error.response.data.error.data as
        | Partial<IntegrationLimitReachedErrorData>
        | null
        | undefined
    return (
        !!data &&
        data.error_code === INTEGRATION_LIMIT_REACHED_ERROR_CODE &&
        typeof data.limit === 'number' &&
        typeof data.current === 'number' &&
        typeof data.upgradable === 'boolean'
    )
}

export enum CursorDirection {
    PrevCursor = 'prev',
    NextCursor = 'next',
}
