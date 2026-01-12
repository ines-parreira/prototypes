import { useCallback, useState } from 'react'

import type { AgentStatusWithSystem } from '../types'

type DeleteModalState = {
    isOpen: boolean
    statusId: string | null
    statusName: string | null
}

export function useDeleteCustomUserAvailabilityStatusModal() {
    const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
        isOpen: false,
        statusId: null,
        statusName: null,
    })

    const openStatusDeleteModal = useCallback(
        (status: AgentStatusWithSystem) => {
            setDeleteModal({
                isOpen: true,
                statusId: status.id,
                statusName: status.name,
            })
        },
        [],
    )

    const closeStatusDeleteModal = useCallback(() => {
        setDeleteModal({
            isOpen: false,
            statusId: null,
            statusName: null,
        })
    }, [])

    return {
        deleteModalState: deleteModal,
        openStatusDeleteModal,
        closeStatusDeleteModal,
    }
}
