import {MatcherContext, MatcherFunction} from '@jest/expect'

import {
    isHtmlElement,
    HtmlElementTypeError,
    isElementOrAncestorAriaDisabled,
} from '../utils'

describe('isHtmlElement', () => {
    it('should throw if input is not valid ', () => {
        let result: boolean | undefined
        const func = () => {
            result = isHtmlElement(
                'notAnElement',
                (() => {}) as unknown as MatcherFunction,
                {} as MatcherContext
            )
        }
        expect(func).toThrow(HtmlElementTypeError)
        expect(result).toBeUndefined()
    })

    it('should throw for almost element-like objects', () => {
        let result: boolean | undefined
        class FakeObject {}
        expect(() => {
            isHtmlElement(
                {
                    ownerDocument: {
                        defaultView: {
                            HTMLElement: FakeObject,
                            SVGElement: FakeObject,
                        },
                    },
                },
                (() => {}) as unknown as MatcherFunction,
                {} as MatcherContext
            )
        }).toThrow(HtmlElementTypeError)
        expect(result).toBeUndefined()
    })

    it('should not throw for body', () => {
        expect(() => {
            isHtmlElement(
                document.body,
                (() => {}) as unknown as MatcherFunction,
                {} as MatcherContext
            )
        }).not.toThrow()
    })

    it('should not throw for correct html element', () => {
        let result: boolean | undefined

        const htmlElement = document.createElement('a')
        const func = () => {
            result = isHtmlElement(
                htmlElement,
                (() => {}) as unknown as MatcherFunction,
                {} as MatcherContext
            )
        }
        expect(func).not.toThrow(HtmlElementTypeError)
        expect(result).toBeTruthy()
    })

    it('should not throw for correct svg element', () => {
        let result: boolean | undefined

        const svgElement = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        )
        const func = () => {
            result = isHtmlElement(
                svgElement,
                (() => {}) as unknown as MatcherFunction,
                {} as MatcherContext
            )
        }
        expect(func).not.toThrow()
        expect(result).toBeTruthy()
    })
})

describe('isElementOrAncestorAriaDisabled', () => {
    it('should return true for disabled element', () => {
        const input = document.createElement('input')
        input.setAttribute('aria-disabled', 'true')

        expect(isElementOrAncestorAriaDisabled(input)).toBeTruthy()
    })

    it('should return true for disabled ancestor', () => {
        const parent = document.createElement('fieldset')
        parent.setAttribute('aria-disabled', 'true')
        const child = document.createElement('input')
        parent.appendChild(child)

        expect(isElementOrAncestorAriaDisabled(child)).toBeTruthy()
    })

    it('should return false if element is a child of first legend child of disabled fieldset', () => {
        // <fieldset aria-disabled="true">
        //   <legend>
        //      <input /> <--- tested element
        //   </legend>
        // </fieldset>
        const fieldset = document.createElement('fieldset')
        fieldset.setAttribute('aria-disabled', 'true')
        const legend = document.createElement('legend')
        fieldset.appendChild(legend)
        const input = document.createElement('input')
        legend.appendChild(input)

        expect(isElementOrAncestorAriaDisabled(input)).toBeFalsy()
    })

    it('should return true if element is not a child of first legend child of disabled fieldset', () => {
        // <fieldset aria-disabled="true">
        //   <legend />
        //   <input /> <--- tested element
        // </fieldset>
        const fieldset = document.createElement('fieldset')
        fieldset.setAttribute('aria-disabled', 'true')
        const legend = document.createElement('legend')
        fieldset.appendChild(legend)
        const input = document.createElement('input')
        fieldset.appendChild(input)

        expect(isElementOrAncestorAriaDisabled(input)).toBeTruthy()
    })

    it('should return false', () => {
        const input = document.createElement('button')
        input.setAttribute('aria-disabled', '')

        expect(isElementOrAncestorAriaDisabled(input)).toBeFalsy()
    })
})
