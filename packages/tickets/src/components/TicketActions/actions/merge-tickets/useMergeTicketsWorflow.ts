import { useCallback } from 'react'

import { useToggle } from '@gorgias/toolkit-react'

export function useMergeTicketsWorflow() {
    const {
        isOpen: isMergeTicketsModalOpen,
        toggle: handleMergeTicketsModalToggle,
    } = useToggle(false)

    const handleMergeTicketsModalClick = useCallback(() => {
        handleMergeTicketsModalToggle(true)
    }, [handleMergeTicketsModalToggle])

    return {
        isMergeTicketsModalOpen,
        handleMergeTicketsModalToggle,
        handleMergeTicketsModalClick,
    }
}
