import { buildReturnOrderSimulationMessages } from './buildReturnOrderSimulationMessages'

describe('buildReturnOrderSimulationMessages', () => {
    it('always includes the sample customer return request as the first message', () => {
        const result = buildReturnOrderSimulationMessages(undefined)

        expect(result[0]).toEqual({
            text: expect.stringContaining("I'd like to return"),
            isHtml: true,
            fromAgent: false,
        })
    })

    it('returns only the customer message when responseMessageContent is undefined', () => {
        const result = buildReturnOrderSimulationMessages(undefined)

        expect(result).toHaveLength(1)
    })

    it('returns only the customer message when the response text is empty', () => {
        const result = buildReturnOrderSimulationMessages({
            html: '',
            text: '',
        })

        expect(result).toHaveLength(1)
    })

    it('includes the agent response as the second message when response text is non-empty', () => {
        const result = buildReturnOrderSimulationMessages({
            html: '<p>Your return has been processed.</p>',
            text: 'Your return has been processed.',
        })

        expect(result).toHaveLength(2)
        expect(result[1]).toEqual({
            text: '<p>Your return has been processed.</p>',
            isHtml: true,
            fromAgent: true,
        })
    })

    it('uses the html content for the agent response, not the plain text', () => {
        const result = buildReturnOrderSimulationMessages({
            html: '<strong>Return approved</strong>',
            text: 'Return approved',
        })

        expect(result[1].text).toBe('<strong>Return approved</strong>')
    })
})
