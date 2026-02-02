import { useCallback } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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
    const appDispatch = useAppDispatch()

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
                await appDispatch(
                    notify({
                        message: notificationMessage,
                        status: NotificationStatus.Success,
                        allowHTML: true,
                        showDismissButton: true,
                    }),
                )

                const isDuplicatingToCurrentStore = shopNames.some(
                    (name) => name === shopName,
                )
                if (isDuplicatingToCurrentStore) {
                    dispatchDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE)
                }
            } catch {
                await appDispatch(
                    notify({
                        message: 'Failed to duplicate guidance',
                        status: NotificationStatus.Error,
                        showDismissButton: true,
                    }),
                )
            } finally {
                contextDispatch({ type: 'SET_UPDATING', payload: false })
                contextDispatch({ type: 'CLOSE_MODAL' })
            }
        },
        [articleId, shopName, duplicate, config, contextDispatch, appDispatch],
    )

    return {
        isOpen: state.activeModal === 'duplicate',
        isDuplicating: state.isUpdating,
        shopName,
        onClose: () => contextDispatch({ type: 'CLOSE_MODAL' }),
        onDuplicate,
    }
}
