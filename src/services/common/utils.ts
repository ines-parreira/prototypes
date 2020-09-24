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

export function isEditable(element: Element): boolean {
    return (
        (element.tagName === 'INPUT' &&
            !nonEditableInputTypes.includes(
                element.getAttribute('type') as any
            )) ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA' ||
        (!!(element as HTMLElement).contentEditable &&
            (element as HTMLElement).contentEditable === 'true')
    )
}
