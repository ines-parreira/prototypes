import { isGorgiasApiError } from 'models/api/types'

export const PENDING_INVOICE_PRORATION_ERROR_MSG =
    'Proration cannot be performed until all pending invoices are resolved.'

export function isPendingInvoiceError(error: unknown): boolean {
    if (!isGorgiasApiError(error)) {
        return false
    }
    return error.response.data.error.msg.includes(
        PENDING_INVOICE_PRORATION_ERROR_MSG,
    )
}
