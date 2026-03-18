import type { Map } from 'immutable'

import * as constants from './constants'

/**
 * Update an invoice in the list of invoices.
 */
export const updateInvoiceInList = (invoice: Map<any, any>) => {
    return {
        type: constants.UPDATE_INVOICE_IN_LIST,
        invoice,
    }
}
