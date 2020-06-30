// @flow
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

export function isEditable(element: HTMLElement): boolean {
    return (
        (element.tagName === 'INPUT' &&
            !nonEditableInputTypes.includes(element.getAttribute('type'))) ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA' ||
        (!!element.contentEditable && element.contentEditable === 'true')
    )
}
