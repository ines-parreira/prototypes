import { MatcherContext } from '@jest/expect'
import { matcherHint, printReceived } from 'jest-matcher-utils'

import { isElementOrAncestorAriaDisabled, isHtmlElement } from './utils'

export default function toBeAriaEnabled(
    this: MatcherContext,
    element: unknown,
) {
    const isElement = isHtmlElement(element, toBeAriaEnabled, this)

    const isAriaEnabled = isElement
        ? !isElementOrAncestorAriaDisabled(element)
        : false

    return {
        pass: isAriaEnabled,
        message: () => {
            const is = isAriaEnabled ? 'is' : 'is not'

            return [
                matcherHint(
                    `${this.isNot ? '.not' : ''}.toBeAriaEnabled`,
                    'element',
                    '',
                ),
                '',
                `Received element ${is} enabled:`,
                `  ${printReceived(
                    isElement ? element.cloneNode(false) : undefined,
                )}`,
            ].join('\n')
        },
    }
}
