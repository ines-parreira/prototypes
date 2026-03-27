import { InvoiceCadence } from '@gorgias/helpdesk-types'

import { Cadence, type ConvertPlan, ProductType } from '../../types'
import { getDefaultConvertPlanIndex } from '../getDefaultConvertPlanIndex'

describe('getDefaultConvertPlanIndex', () => {
    const convertAvailablePlans: ConvertPlan[] = [
        {
            product: ProductType.Convert,
            num_quota_tickets: 100,
            amount: 1000,
            currency: 'usd',
            custom: false,
            extra_ticket_cost: 0,
            plan_id: 'convert-01-monthly',
            cadence: Cadence.Month,
            invoice_cadence: InvoiceCadence.Month,
            name: 'Starter',
            public: true,
            tier: 1,
        },
        {
            product: ProductType.Convert,
            num_quota_tickets: 200,
            amount: 2000,
            currency: 'usd',
            custom: false,
            extra_ticket_cost: 0,
            plan_id: 'convert-02-monthly',
            cadence: Cadence.Month,
            invoice_cadence: InvoiceCadence.Month,
            name: 'Advanced',
            public: true,
            tier: 2,
        },
        {
            product: ProductType.Convert,
            num_quota_tickets: 300,
            amount: 3000,
            currency: 'usd',
            custom: false,
            extra_ticket_cost: 0,
            plan_id: 'convert-03-yearly',
            cadence: Cadence.Year,
            invoice_cadence: InvoiceCadence.Year,
            name: 'Custom',
            public: true,
            tier: 3,
        },
    ]

    it.each([
        [undefined, undefined, undefined, 0],
        [[], undefined, undefined, -1],
        [convertAvailablePlans, Cadence.Month, 'Unknown', 0],
        [convertAvailablePlans, Cadence.Month, 'Starter', 0],
        [convertAvailablePlans, Cadence.Month, 'Advanced', 1],
        [convertAvailablePlans, Cadence.Year, 'Custom', 2],
    ])(
        "should return the correct default convert price index ( '%s',  '%s',  '%s')",
        (availablePlans, cadence, helpdeskPlanName, expectedValue) => {
            expect(
                getDefaultConvertPlanIndex(
                    cadence,
                    availablePlans,
                    helpdeskPlanName,
                ),
            ).toBe(expectedValue)
        },
    )
})
