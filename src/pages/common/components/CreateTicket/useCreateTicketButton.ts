import { useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import useHandleTicketDraft from './useHandleTicketDraft'

const createTicketPath = '/app/ticket/new'

export function useCreateTicketButton() {
    const history = useHistory()
    const { hasDraft, onResumeDraft, onDiscardDraft } = useHandleTicketDraft()

    const createTicketActions = useMemo(
        () => ({
            CREATE_TICKET: {
                action: (e: Event) => {
                    e.preventDefault()
                    history.push(createTicketPath)
                },
            },
        }),
        [history],
    )

    return {
        createTicketPath,
        createTicketActions,
        hasDraft,
        onResumeDraft,
        onDiscardDraft,
    }
}
