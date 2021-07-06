import React from 'react'

import {useOnClickOutside} from './useOnClickOutside'

type HookApi = {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

export function useOpenToggle(
    ref: React.RefObject<HTMLElement>,
    defaultValue = false
): HookApi {
    const [isOpen, setOpen] = React.useState(defaultValue)

    const handleOpen = React.useCallback(() => setOpen(true), [])
    const handleClose = React.useCallback(() => setOpen(false), [])

    useOnClickOutside(ref, handleClose)

    return {
        isOpen,
        onOpen: handleOpen,
        onClose: handleClose,
    }
}
