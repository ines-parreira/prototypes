import { MatcherContext } from '@jest/expect'

import toBeAriaDisabled from '../toBeAriaDisabled'

describe('toBeAriaDisabled', () => {
    const context = {} as MatcherContext

    it('should return true for disabled element', () => {
        const input = document.createElement('input')
        input.setAttribute('aria-disabled', 'true')

        const result = toBeAriaDisabled.call(context, input)

        expect(result).toMatchObject({
            pass: true,
            message: expect.any(Function),
        })

        const message = result.message()
        expect(message).toContain('Received element is disabled:')
    })

    it('should return false for non disabled element', () => {
        const input = document.createElement('button')
        input.setAttribute('aria-disabled', '')

        const result = toBeAriaDisabled.call(context, input)

        expect(result).toMatchObject({
            pass: false,
            message: expect.any(Function),
        })

        const message = result.message()
        expect(message).toContain('Received element is not disabled:')
    })

    it('should return true even if element is not element that can be disabled but parent is', () => {
        const button = document.createElement('button')
        const span = document.createElement('span')
        button.appendChild(span)
        button.setAttribute('aria-disabled', 'true')

        const result = toBeAriaDisabled.call(context, span)

        expect(result).toMatchObject({
            pass: true,
            message: expect.any(Function),
        })

        const message = result.message()
        expect(message).toContain('Received element is disabled:')
    })
})
