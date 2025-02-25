import {MatcherContext, MatcherFunction} from '@jest/expect'
import {
    matcherHint,
    printReceived,
    printWithType,
    RECEIVED_COLOR,
} from 'jest-matcher-utils'

// Utils taken from https://github.com/testing-library/jest-dom/blob/main/src/utils.js#L4
// and simplified to our needs
class GenericTypeError extends Error {
    constructor(
        expectedString: string,
        received: unknown,
        matcherFn: MatcherFunction,
        context: MatcherContext
    ) {
        super()

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, matcherFn)
        }

        let withType = ''
        try {
            withType = printWithType('Received', received, printReceived)
        } catch {
            // Can throw for Document:
            // https://github.com/jsdom/jsdom/issues/2304
        }

        this.message = [
            matcherHint(
                `${context.isNot ? '.not' : ''}.${matcherFn.name}`,
                'received',
                ''
            ),
            '',
            `${RECEIVED_COLOR('received')} value must ${expectedString}.`,
            withType,
        ].join('\n')
    }
}

export class HtmlElementTypeError extends GenericTypeError {
    constructor(...args: [unknown, MatcherFunction, MatcherContext]) {
        super('be an HTMLElement or an SVGElement', ...args)
    }
}

const isValidElement = (
    value: unknown
): value is {
    ownerDocument: {
        defaultView: Document['defaultView']
    }
} =>
    typeof value === 'object' &&
    value !== null &&
    'ownerDocument' in value &&
    typeof value.ownerDocument === 'object' &&
    value.ownerDocument !== null &&
    'defaultView' in value.ownerDocument

export function isHtmlElement(
    element: unknown,
    ...args: [MatcherFunction, MatcherContext]
): element is HTMLElement {
    if (
        !isValidElement(element) ||
        !(
            element instanceof window.SVGElement ||
            element instanceof window.HTMLElement
        )
    ) {
        throw new HtmlElementTypeError(element, ...args)
    }
    return true
}

/*
 * Matcher with the same behaviour as `isDisabled` but checks `aria-disabled`
 * instead of `disabled` attribute.
 * See https://github.com/testing-library/jest-dom/blob/main/src/to-be-disabled.js
 */

function getTag(element: HTMLElement) {
    return element.tagName.toLowerCase()
}

// form elements that support 'aria-disabled'
const FORM_TAGS = [
    'fieldset',
    'input',
    'select',
    'optgroup',
    'option',
    'button',
    'textarea',
]

/*
 * According to specification:
 * If <fieldset> is disabled, the form controls that are its descendants,
 * except descendants of its first optional <legend> element, are disabled
 *
 * https://html.spec.whatwg.org/multipage/form-elements.html#concept-fieldset-disabled
 *
 * This method tests whether element is first legend child of fieldset parent
 */
function isFirstLegendChildOfFieldset(
    element: HTMLElement,
    parent: HTMLElement
) {
    const firstLegentChild = Array.from(parent.children).find(
        (child) => getTag(child as HTMLElement) === 'legend'
    )
    return (
        firstLegentChild &&
        getTag(element) === 'legend' &&
        getTag(parent) === 'fieldset' &&
        element.isSameNode(firstLegentChild)
    )
}

function isElementAriaDisabledByParent(
    element: HTMLElement,
    parent: HTMLElement | null
) {
    return (
        parent &&
        isElementAriaDisabled(parent) &&
        !isFirstLegendChildOfFieldset(element, parent)
    )
}

function isCustomElement(tag: string) {
    return tag.includes('-')
}

/*
 * Only certain form elements and custom elements can actually be disabled:
 * https://html.spec.whatwg.org/multipage/semantics-other.html#disabled-elements
 */
function canElementBeAriaDisabled(element: HTMLElement) {
    const tag = getTag(element)
    return FORM_TAGS.includes(tag) || isCustomElement(tag)
}

function isElementAriaDisabled(element: HTMLElement) {
    return (
        canElementBeAriaDisabled(element) &&
        element.getAttribute('aria-disabled') === 'true'
    )
}

function isAncestorAriaDisabled(element: HTMLElement | null): boolean {
    const parent = element?.parentElement
    return (
        !!parent &&
        (isElementAriaDisabledByParent(element, parent) ||
            isAncestorAriaDisabled(parent))
    )
}

export function isElementOrAncestorAriaDisabled(element: HTMLElement) {
    return isElementAriaDisabled(element) || isAncestorAriaDisabled(element)
}
