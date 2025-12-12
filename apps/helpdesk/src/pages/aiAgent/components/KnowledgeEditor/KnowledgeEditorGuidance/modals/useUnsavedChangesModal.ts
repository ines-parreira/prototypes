import { useCallback } from 'react'

import { useGuidanceContext } from '../context'

export const useUnsavedChangesModal = () => {
    const { state, dispatch, config } = useGuidanceContext()

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
