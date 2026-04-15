import { buildCancelOrderSimulationMessages } from './buildCancelOrderSimulationMessages'

describe('buildCancelOrderSimulationMessages', () => {
    it('always includes the sample customer cancel request as the first message', () => {
        const result = buildCancelOrderSimulationMessages({
            html: '',
            text: '',
        })

        expect(result[0]).toEqual({
            text: expect.stringContaining("I'd like to cancel"),
            isHtml: true,
            fromAgent: false,
        })
    })

    it('returns only the customer message when the response text is empty', () => {
        const result = buildCancelOrderSimulationMessages({
            html: '',
            text: '',
        })

        expect(result).toHaveLength(1)
    })

    it('includes the agent response as the second message when response text is non-empty', () => {
        const result = buildCancelOrderSimulationMessages({
            html: '<p>Your order has been cancelled.</p>',
            text: 'Your order has been cancelled.',
        })

        expect(result).toHaveLength(2)
        expect(result[1]).toEqual({
            text: '<p>Your order has been cancelled.</p>',
            isHtml: true,
            fromAgent: true,
        })
    })

    it('uses the html content for the agent response, not the plain text', () => {
        const result = buildCancelOrderSimulationMessages({
            html: '<strong>Cancelled</strong>',
            text: 'Cancelled',
        })

        expect(result[1].text).toBe('<strong>Cancelled</strong>')
    })
})
