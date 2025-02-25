import { MatcherContext } from '@jest/expect'

import toBeAriaEnabled from '../toBeAriaEnabled'

describe('toBeAriaEnabled', () => {
    const context = {} as MatcherContext

    it('should return true for non disabled element', () => {
        const input = document.createElement('input')
        input.setAttribute('aria-disabled', 'f')

        const result = toBeAriaEnabled.call(context, input)

        expect(result).toMatchObject({
            pass: true,
            message: expect.any(Function),
        })

        const message = result.message()
        expect(message).toContain('Received element is enabled:')
    })

    it('should return false for disabled element', () => {
        const input = document.createElement('button')
        input.setAttribute('aria-disabled', 'true')

        const result = toBeAriaEnabled.call(context, input)

        expect(result).toMatchObject({
            pass: false,
            message: expect.any(Function),
        })

        const message = result.message()
        expect(message).toContain('Received element is not enabled:')
    })
})
