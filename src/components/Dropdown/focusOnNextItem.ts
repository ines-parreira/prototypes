import { KeyboardEvent, RefObject } from 'react'

export default function focusOnNextItem(
    e: KeyboardEvent<HTMLElement>,
    ref?: RefObject<HTMLDivElement>,
) {
    if (
        document.activeElement === e.currentTarget &&
        ['ArrowUp', 'ArrowDown'].includes(e.key)
    ) {
        e.preventDefault()
        const items: HTMLElement[] = Array.from(
            ref?.current?.querySelectorAll('[role="listitem"]') ?? [],
        )

        const index = items.indexOf(document.activeElement as HTMLElement)

        if (index > -1) {
            if (e.key === 'ArrowUp') {
                items[index === 0 ? items.length - 1 : index - 1].focus()
            } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                items[index === items.length - 1 ? 0 : index + 1].focus()
            }
        }
    }
}
