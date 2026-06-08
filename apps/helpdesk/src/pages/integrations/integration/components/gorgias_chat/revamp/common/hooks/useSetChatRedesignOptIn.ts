import { useCallback, useState } from 'react'

import { fromJS } from 'immutable'
import type { Map } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import { updateOrCreateIntegration } from 'state/integrations/actions'

/**
 * Persists (or clears) the Chat 2.0 opt-in on the integration. Shared by the
 * opt-in banner (switch to new chat) and the settings header (switch to old
 * chat) so both go through the same mutation.
 */
export const useSetChatRedesignOptIn = (integration: Map<any, any>) => {
    const dispatch = useAppDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const setOptIn = useCallback(
        async (optedIn: boolean) => {
            setIsSubmitting(true)
            const originalMeta = integration.get('meta')?.toJS() ?? {}
            const form = {
                id: integration.get('id'),
                type: integration.get('type'),
                meta: {
                    ...originalMeta,
                    chat_redesign_opt_in_datetime: optedIn
                        ? new Date().toISOString()
                        : null,
                },
            }
            try {
                await dispatch(
                    updateOrCreateIntegration(
                        fromJS(form),
                        undefined,
                        undefined,
                        undefined,
                        // Suppress the legacy reapop snackbar; callers surface
                        // their own axiom toast instead.
                        true,
                        undefined,
                        true,
                    ),
                )
            } finally {
                setIsSubmitting(false)
            }
        },
        [dispatch, integration],
    )

    return { setOptIn, isSubmitting }
}
