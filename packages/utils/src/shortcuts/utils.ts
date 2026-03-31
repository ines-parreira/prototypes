import type { Maybe } from '@repo/types'

/**
 * Find the closest parent that matches the selector
 */
export function closest(element: Element, selector: string): Maybe<Element> {
    let matches
    let elem = element

    // loop through parents
    //@ts-ignore ts(2367)
    while (elem && elem !== document) {
        if (elem.parentElement) {
            // find all siblings that match the selector
            matches = elem.parentElement.querySelectorAll(selector)
            // check if our element is matched (poor-man's Element.matches())
            if ([].indexOf.call(matches, elem as never) !== -1) {
                return elem
            }

            // go up the tree
            elem = elem.parentElement
        } else {
            return null
        }
    }

    return null
}

/**
 * Return '⌘' if the user is using a Mac, Ctrl/Meta otherwise
 */
export function getModifier(defaultKey = 'Ctrl'): string {
    const isMac = navigator.platform.toLowerCase().startsWith('mac')
    return isMac ? '⌘' : defaultKey
}

export function isGlobalNavigationButton(element: Element): boolean {
    if (element.getAttribute('aria-label')?.includes('Menu')) {
        return true
    }

    return false
}

/**
 * Check if element is button
 */
export function isButton(element: Element): boolean {
    const type = element.getAttribute('type') || ''
    return (
        element.tagName === 'BUTTON' ||
        (element.tagName === 'INPUT' && type.toLowerCase() === 'submit')
    )
}

/**
 * Check if element is editable (form elements, contentEditable)
 */
const nonEditableInputTypes = [
    'button',
    'checkbox',
    'color',
    'file',
    'hidden',
    'image',
    'radio',
    'range',
    'reset',
    'submit',
]

const editableRoleSelector = [
    '[role="textbox"]',
    '[role="searchbox"]',
    '[role="combobox"]',
].join(', ')

export function isEditable(element: Element): boolean {
    const nativeEditableElement = element.closest('input, select, textarea')
    const isNativeEditableInput =
        nativeEditableElement?.tagName === 'INPUT' &&
        !nonEditableInputTypes.includes(
            nativeEditableElement.getAttribute('type')?.toLowerCase() as any,
        )
    const isNativeEditableControl =
        isNativeEditableInput ||
        nativeEditableElement?.tagName === 'SELECT' ||
        nativeEditableElement?.tagName === 'TEXTAREA'

    let currentElement: Element | null = element
    let isContentEditable = false

    while (currentElement) {
        if ((currentElement as HTMLElement).contentEditable === 'true') {
            isContentEditable = true
            break
        }

        currentElement = currentElement.parentElement
    }

    return (
        isNativeEditableControl ||
        isContentEditable ||
        element.closest(editableRoleSelector) !== null
    )
}
