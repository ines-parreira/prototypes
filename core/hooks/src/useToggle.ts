import { useCallback, useMemo, useState } from 'react'

export const useToggle = (initialValue = false) => {
    const [isOpen, setIsOpen] = useState(initialValue)
    const toggle = useCallback(
        (nextValue?: boolean) => setIsOpen((value) => nextValue ?? !value),
        [],
    )
    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])

    return useMemo(
        () => ({ isOpen, toggle, open, close }),
        [isOpen, toggle, open, close],
    )
}
