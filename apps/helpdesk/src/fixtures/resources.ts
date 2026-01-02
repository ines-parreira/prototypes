import type { BillingContactDetailResponse } from 'state/billing/types'
import { TaxIdType, TaxIdVerificationStatus } from 'state/billing/types'

export const billingContact: BillingContactDetailResponse = {
    email: 'example@gorgias.com',
    shipping: {
        name: 'Gorgias',
        phone: '+3301234567',
        address: {
            line1: '1234 Main St',
            line2: 'Apt 1',
            city: 'Paris',
            state: 'Ile de France',
            postal_code: '75001',
            country: 'FR',
        },
    },
    tax_ids: {
        [TaxIdType.eu_vat]: {
            type: TaxIdType.eu_vat,
            value: 'EU123456789',
            verification: TaxIdVerificationStatus.Verified,
        },
    },
}
