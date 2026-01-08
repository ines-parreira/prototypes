import { useCallback } from 'react'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

import { useGuidanceContext } from '../context'

export const useDeleteModal = () => {
    const { state, dispatch, config } = useGuidanceContext()
    const { error: notifyError } = useNotify()

    const { deleteGuidanceArticle } = useGuidanceArticleMutation({
        guidanceHelpCenterId: config.guidanceHelpCenter?.id ?? 0,
    })

    const onDelete = useCallback(async () => {
        if (!state.guidance?.id) return

        dispatch({ type: 'SET_UPDATING', payload: true })
        try {
            await deleteGuidanceArticle(state.guidance.id)
            config.onDeleteFn?.()
        } catch {
            notifyError('An error occurred while deleting guidance.')
        } finally {
            dispatch({ type: 'SET_UPDATING', payload: false })
            dispatch({ type: 'CLOSE_MODAL' })
            config.onClose?.()
        }
    }, [
        deleteGuidanceArticle,
        state.guidance?.id,
        config,
        dispatch,
        notifyError,
    ])

    const hasBothVersions =
        !!state.guidance?.publishedVersionId &&
        state.guidance?.draftVersionId !== state.guidance?.publishedVersionId

    return {
        isOpen: state.activeModal === 'delete',
        isDeleting: state.isUpdating,
        hasBothVersions,
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDelete,
    }
}
