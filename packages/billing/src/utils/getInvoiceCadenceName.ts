import { InvoiceCadence } from '@gorgias/helpdesk-types'

export function getInvoiceCadenceName(invoiceCadence: InvoiceCadence): string {
    switch (invoiceCadence) {
        case InvoiceCadence.Month:
            return 'Monthly'
        case InvoiceCadence.Quarter:
            return 'Quarterly'
        case InvoiceCadence.Biannual:
            return 'Biannually'
        case InvoiceCadence.Year:
            return 'Yearly'
        default: {
            const __: never = invoiceCadence
            throw new Error(`Invalid invoice cadence value: ${__}`)
        }
    }
}
