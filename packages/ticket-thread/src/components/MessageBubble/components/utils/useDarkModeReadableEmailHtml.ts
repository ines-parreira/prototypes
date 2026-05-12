import { useMemo } from 'react'

export const EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS =
    'message-body-element-with-authored-background'

const BACKGROUND_ATTRIBUTE_PATTERN = /\s(?:style|bgcolor)\s*=/i
const BACKGROUND_DECLARATION_PATTERN =
    /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/gi
const EMPTY_BACKGROUND_VALUE_PATTERN =
    /^(transparent|none|inherit|initial|unset|rgba\([^)]*,\s*0(?:\.0+)?\)|hsla\([^)]*,\s*0(?:\.0+)?\))$/i

function normalizeCssValue(value: string): string {
    return value.replace(/\s*!important\s*$/i, '').trim()
}

function hasPaintedBackgroundValue(value: string | null): boolean {
    if (!value) {
        return false
    }

    const normalizedValue = normalizeCssValue(value)

    return (
        normalizedValue.length > 0 &&
        !EMPTY_BACKGROUND_VALUE_PATTERN.test(normalizedValue)
    )
}

function hasPaintedBackgroundDeclaration(style: string): boolean {
    BACKGROUND_DECLARATION_PATTERN.lastIndex = 0

    return Array.from(style.matchAll(BACKGROUND_DECLARATION_PATTERN)).some(
        (match) => hasPaintedBackgroundValue(match[1]),
    )
}

function hasAuthoredBackground(element: HTMLElement): boolean {
    return (
        hasPaintedBackgroundValue(element.getAttribute('bgcolor')) ||
        hasPaintedBackgroundDeclaration(element.getAttribute('style') ?? '')
    )
}

export function annotateDarkModeReadableEmailHtml(html: string): string {
    if (!BACKGROUND_ATTRIBUTE_PATTERN.test(html)) {
        return html
    }

    if (typeof document === 'undefined') {
        return html
    }

    const template = document.createElement('template')
    template.innerHTML = html

    const elements = Array.from(
        template.content.querySelectorAll<HTMLElement>('*'),
    )

    elements.forEach((element) => {
        if (hasAuthoredBackground(element)) {
            element.classList.add(EMAIL_ELEMENT_WITH_AUTHORED_BACKGROUND_CLASS)
        }
    })

    return template.innerHTML
}

export function useDarkModeReadableEmailHtml(html: string): string {
    return useMemo(() => annotateDarkModeReadableEmailHtml(html), [html])
}
