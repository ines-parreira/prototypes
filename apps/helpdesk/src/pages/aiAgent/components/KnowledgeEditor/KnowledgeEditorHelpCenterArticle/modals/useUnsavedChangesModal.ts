import { useCallback } from 'react'

import { useArticleContext } from '../context'

export const useUnsavedChangesModal = () => {
    const { state, dispatch, config } = useArticleContext()

    const onDiscard = useCallback(() => {
        dispatch({ type: 'CLOSE_MODAL' })
        config.onClose()
    }, [dispatch, config])

    return {
        isOpen: state.activeModal === 'unsaved',
        onClose: () => dispatch({ type: 'CLOSE_MODAL' }),
        onDiscard,
    }
}
