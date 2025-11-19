import { useCallback } from 'react'

import { dismissNotification } from 'reapop'

import useAppDispatch from 'hooks/useAppDispatch'

/**
 * Will need to be removed once the notification (toast) system is migrated to the Axiom
 * design system
 */
export function useLegacyDispatchDismissNotification() {
    const dispatch = useAppDispatch()
    return useCallback(
        (id: string) => dispatch(dismissNotification(id)),
        [dispatch],
    )
}
