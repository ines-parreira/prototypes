import { useMemo } from 'react'

import { getCreateTicketPathWithPreviousURL } from '@repo/tickets/utils/routing'
import { useHistory } from 'react-router-dom'

import useHandleTicketDraft from './useHandleTicketDraft'

export function useCreateTicketButton() {
    const history = useHistory()
    const { hasDraft, onResumeDraft, onDiscardDraft } = useHandleTicketDraft()
    const createTicketPath = getCreateTicketPathWithPreviousURL(
        history.location,
    )

    const createTicketActions = useMemo(
        () => ({
            CREATE_TICKET: {
                action: (e: Event) => {
                    e.preventDefault()
                    history.push(createTicketPath)
                },
            },
        }),
        [createTicketPath, history],
    )

    return {
        createTicketPath,
        createTicketActions,
        hasDraft,
        onResumeDraft,
        onDiscardDraft,
    }
}
