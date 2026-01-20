import { useCallback, useState } from 'react'

import type { AgentStatusWithSystem } from '../types'

type ModalState = {
    isOpen: boolean
    isDelete: boolean
    status?: AgentStatusWithSystem
}

/**
 * Hook to manage custom user unavailability modal state.
 * This hook manages both create/edit and delete modal states.
 * Business logic (mutations, notifications) should be handled by the consumer component.
 */
export function useCustomUserUnavailabilityModal() {
    const [state, setState] = useState<ModalState>({
        isOpen: false,
        isDelete: false,
        status: undefined,
    })

    const openCreate = useCallback(() => {
        setState({ isOpen: true, isDelete: false, status: undefined })
    }, [])

    const openEdit = useCallback((status: AgentStatusWithSystem) => {
        setState({ isOpen: true, isDelete: false, status })
    }, [])

    const openDelete = useCallback((status: AgentStatusWithSystem) => {
        setState({ isOpen: true, isDelete: true, status })
    }, [])

    const close = useCallback(() => {
        setState({ isOpen: false, isDelete: false, status: undefined })
    }, [])

    return {
        state,
        openCreate,
        openEdit,
        openDelete,
        close,
    }
}
