// @flow
/**
 * Check if element is editable (form elements, contentEditable)
 */
export function isEditable(element: HTMLElement): boolean {
    return element.tagName === 'INPUT'
        || element.tagName === 'SELECT'
        || element.tagName === 'TEXTAREA'
        || (
            !!element.contentEditable
            && element.contentEditable === 'true'
        )
}
