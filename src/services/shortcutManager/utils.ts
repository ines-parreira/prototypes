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
