import { logEvent, SegmentEvent } from '@repo/logging'

import { InvoiceCadence } from '@gorgias/helpdesk-types'

import { Cadence, type ConvertPlan, ProductType } from '../../types'
import { handleConvertProductDowngraded } from '../handleConvertProductDowngraded'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        ConvertBillingProductScheduledDowngrade:
            'ConvertBillingProductScheduledDowngrade',
        ConvertBillingProductRemoved: 'ConvertBillingProductRemoved',
    },
}))

const logEventMock = vi.mocked(logEvent)

describe('handleConvertProductDowngraded', () => {
    it('should log the event', () => {
        const convertPlan1: ConvertPlan = {
            product: ProductType.Convert,
            num_quota_tickets: 100,
            amount: 1000,
            currency: 'usd',
            custom: false,
            extra_ticket_cost: 0,
            plan_id: 'convert-01',
            cadence: Cadence.Month,
            invoice_cadence: InvoiceCadence.Month,
            name: 'Starter',
            public: true,
            tier: 1,
        }
        const convertPlan2 = { ...convertPlan1, plan_id: 'convert-02', tier: 2 }

        handleConvertProductDowngraded(convertPlan2, convertPlan1, 'acme-shop')

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ConvertBillingProductScheduledDowngrade,
            {
                account: 'acme-shop',
                from: convertPlan2.plan_id,
                to: convertPlan1.plan_id,
            },
        )
    })
})
