import {matcherHint, printReceived} from 'jest-matcher-utils'
import {MatcherContext} from '@jest/expect'

import {isElementOrAncestorAriaDisabled, isHtmlElement} from './utils'

export default function toBeAriaDisabled(
    this: MatcherContext,
    element: unknown
) {
    const isElement = isHtmlElement(element, toBeAriaDisabled, this)

    const isAriaDisabled = isElement
        ? isElementOrAncestorAriaDisabled(element)
        : false

    return {
        pass: isAriaDisabled,
        message: () => {
            const is = isAriaDisabled ? 'is' : 'is not'

            return [
                matcherHint(
                    `${this.isNot ? '.not' : ''}.toBeAriaDisabled`,
                    'element',
                    ''
                ),
                '',
                `Received element ${is} disabled:`,
                `  ${printReceived(
                    isElement ? element.cloneNode(false) : undefined
                )}`,
            ].join('\n')
        },
    }
}
