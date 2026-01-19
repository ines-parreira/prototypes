import type { Customer } from '@gorgias/helpdesk-types'

export interface GetSimilarCustomerParams {
    customerId: number
}

/**
 * temporary getter until we get OpenAPI spec to include this
 * so that it is available through rest-api-sdk packages
 * https://linear.app/gorgias/issue/SUPXP-5013/customer-similar-resource-not-available-in-openapi-spec
 */

export async function getSimilarCustomer(
    params: GetSimilarCustomerParams,
    signal?: AbortSignal,
): Promise<Customer | null> {
    const response = await fetch(
        `/api/customers/${params.customerId}/similar/`,
        { signal },
    )

    if (response.status !== 200) {
        return null
    }

    const text = await response.text()
    if (!text || text.trim() === '') {
        return null
    }

    try {
        return JSON.parse(text)
    } catch {
        return null
    }
}
