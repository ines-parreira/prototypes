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

function isQuotaExceededError(e: DOMException): boolean {
    return (
        // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )
}

export function isLocalStorageAvailable() {
    let storage
    try {
        storage = window.localStorage
        const x = '__storage_test__'
        storage.setItem(x, x)
        storage.removeItem(x)
        return true
    } catch (e) {
        return (
            e instanceof DOMException &&
            isQuotaExceededError(e) &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        )
    }
}

export function tryLocalStorage(fn: (arg?: any) => any) {
    if (isLocalStorageAvailable()) {
        try {
            fn()
        } catch (e) {
            if (!(e instanceof DOMException && isQuotaExceededError(e))) {
                throw e
            }
        }
    }
}
