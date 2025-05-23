import { fireEvent } from '@testing-library/react'
import BaseUserEvent from '@testing-library/user-event'

/**
 * @deprecated This custom `userEvent` wrapper is deprecated.
 * Use `fireEvent` from `@testing-library/react` or `userEvent` from `@testing-library/user-event` instead.
 */
export const userEvent = {
    ...BaseUserEvent,
    click: (element: Element, options?: Partial<MouseEvent>) => {
        fireEvent.pointerDown(element)
        fireEvent.mouseDown(element)
        element instanceof HTMLElement && element.focus?.()
        fireEvent.mouseUp(element)
        fireEvent.click(element, options)
    },

    clear: (element: Element) => {
        if (element instanceof Element) {
            fireEvent.change(element, { target: { value: '' } })
        }
    },

    type: (element: Element, text: string) => {
        if (element instanceof Element) {
            fireEvent.change(element, { target: { value: text } })
        }
    },
    paste: (element: Element, text: string) => {
        if (element instanceof Element) {
            fireEvent.paste(element, {
                clipboardData: {
                    getData: () => text,
                },
            })
            fireEvent.change(element, { target: { value: text } })
        }
    },
}
