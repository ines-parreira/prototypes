import { useCallback } from 'react'

import { toast } from '@gorgias/axiom'

import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { REFETCH_KNOWLEDGE_HUB_TABLE } from '../../../../KnowledgeHub/constants'
import { dispatchDocumentEvent } from '../../../../KnowledgeHub/EmptyState/utils'
import type { StoreIntegrationItem } from '../../shared/DuplicateGuidance/types'
import {
    buildDuplicateNotificationMessage,
    cleanStoreName,
} from '../../shared/DuplicateGuidance/utils'
import { useGuidanceContext } from '../context'

export const useDuplicateModal = () => {
    const { state, dispatch: contextDispatch, config } = useGuidanceContext()

    const { duplicate } = useGuidanceArticleMutation({
        guidanceHelpCenterId: config.guidanceHelpCenter?.id ?? 0,
    })

    const articleId = state.guidance?.id
    const shopName = config.shopName

    const onDuplicate = useCallback(
        async (selectedStores: StoreIntegrationItem[]) => {
            if (!articleId || selectedStores.length === 0) return

            const shopNames = selectedStores.map((store) =>
                cleanStoreName(store.name),
            )

            contextDispatch({ type: 'SET_UPDATING', payload: true })
            try {
                await duplicate([articleId], shopNames)
                config.onCopyFn?.()

                const notificationMessage = buildDuplicateNotificationMessage(
                    selectedStores,
                    shopName,
                )
                toast.success(notificationMessage)

                const isDuplicatingToCurrentStore = shopNames.some(
                    (name) => name === shopName,
                )
                if (isDuplicatingToCurrentStore) {
                    dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
                }
            } catch {
                toast.error('Failed to duplicate guidance')
            } finally {
                contextDispatch({ type: 'SET_UPDATING', payload: false })
                contextDispatch({ type: 'CLOSE_MODAL' })
            }
        },
        [articleId, shopName, duplicate, config, contextDispatch],
    )

    return {
        isOpen: state.activeModal === 'duplicate',
        isDuplicating: state.isUpdating,
        shopName,
        onClose: () => contextDispatch({ type: 'CLOSE_MODAL' }),
        onDuplicate,
    }
}
