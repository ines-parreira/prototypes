import { guidanceVariables } from './variables'
import type { GuidanceVariable } from './variables.types'

describe('guidanceVariables - branch changes', () => {
    describe('Ticket group', () => {
        it('should have Ticket group with Creation date variable', () => {
            const ticketGroup = guidanceVariables.find(
                (group) => group.name === 'Ticket',
            )

            expect(ticketGroup).toBeDefined()
            expect(ticketGroup?.variables).toHaveLength(1)

            const creationDateVar = ticketGroup
                ?.variables[0] as GuidanceVariable
            expect(creationDateVar.name).toBe('Creation date')
            expect(creationDateVar.value).toBe('&&&ticket.created_at&&&')
            expect(creationDateVar.category).toBe('ticket')
        })
    })

    describe('Shopify group - new variables', () => {
        let shopifyGroup: ReturnType<typeof guidanceVariables.find>

        beforeEach(() => {
            shopifyGroup = guidanceVariables.find(
                (group) => group.name === 'Shopify',
            )
        })

        it('should have Fulfillment - Service variable', () => {
            const serviceVar = shopifyGroup?.variables.find(
                (v) =>
                    'value' in v &&
                    v.value === '&&&order.fulfillment.service&&&',
            ) as GuidanceVariable

            expect(serviceVar).toBeDefined()
            expect(serviceVar.name).toBe('Fulfillment - Service')
            expect(serviceVar.category).toBe('order')
        })

        it('should have Shipment - Status variable', () => {
            const shipmentStatusVar = shopifyGroup?.variables.find(
                (v) =>
                    'value' in v &&
                    v.value === '&&&order.fulfillment.shipment_status&&&',
            ) as GuidanceVariable

            expect(shipmentStatusVar).toBeDefined()
            expect(shipmentStatusVar.name).toBe('Shipment - Status')
            expect(shipmentStatusVar.category).toBe('order')
        })

        it('should have Refund - Processed at variable', () => {
            const refundVar = shopifyGroup?.variables.find(
                (v) =>
                    'value' in v &&
                    v.value === '&&&order.refund.processed_at&&&',
            ) as GuidanceVariable

            expect(refundVar).toBeDefined()
            expect(refundVar.name).toBe('Refund - Processed at')
            expect(refundVar.category).toBe('order')
        })

        it('should have Return - Received at variable', () => {
            const returnReceivedVar = shopifyGroup?.variables.find(
                (v) =>
                    'value' in v &&
                    v.value === '&&&order.return.received_at&&&',
            ) as GuidanceVariable

            expect(returnReceivedVar).toBeDefined()
            expect(returnReceivedVar.name).toBe('Return - Received at')
            expect(returnReceivedVar.category).toBe('order')
        })

        it('should have Return - Closed at variable', () => {
            const returnClosedVar = shopifyGroup?.variables.find(
                (v) =>
                    'value' in v && v.value === '&&&order.return.closed_at&&&',
            ) as GuidanceVariable

            expect(returnClosedVar).toBeDefined()
            expect(returnClosedVar.name).toBe('Return - Closed at')
            expect(returnClosedVar.category).toBe('order')
        })
    })
})
