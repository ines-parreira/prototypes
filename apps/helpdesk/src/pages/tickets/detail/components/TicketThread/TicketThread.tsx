import { useCallback, useMemo } from 'react'

import { TicketThreadContainer } from '@repo/tickets/ticket-thread'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Editor from 'pages/common/editor/Editor'
import useInitialMacroFilters from 'pages/common/editor/hooks/useInitialMacroFilters'
import WhatsAppEditorProvider from 'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider'
import TypingActivity from 'pages/tickets/detail/components/TypingActivity'
import type { SubmitArgs } from 'pages/tickets/detail/TicketDetailContainer'
import { getTicket, getTicketState } from 'state/ticket/selectors'
import { editorFocused } from 'state/ui/editor/actions'

type TicketThreadProps = {
    submit: (params: SubmitArgs) => any
}

export function TicketThread({ submit }: TicketThreadProps) {
    const dispatch = useAppDispatch()
    const ticketState = useAppSelector(getTicketState)
    const ticket = useAppSelector(getTicket)
    const initialMacroFilters = useInitialMacroFilters()
    const isShopperTyping = useMemo(
        () => ticketState.getIn(['_internal', 'isShopperTyping']) as boolean,
        [ticketState],
    )

    const shopperName = useMemo(
        () => ticket.customer?.name ?? 'Customer',
        [ticket.customer?.name],
    )

    const handleBlur = useCallback(() => {
        dispatch(editorFocused(false))
    }, [dispatch])

    const handleFocus = useCallback(() => {
        dispatch(editorFocused(true))
    }, [dispatch])

    return (
        <TicketThreadContainer>
            {Array.from({ length: 100 }).map((_, index) => (
                <div key={index}>Thread feed item {index + 1}</div>
            ))}
            <div>
                <TypingActivity isTyping={isShopperTyping} name={shopperName} />
                <WhatsAppEditorProvider>
                    <Editor
                        initialMacroFilters={initialMacroFilters}
                        submit={submit}
                        ticket={ticket}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                    />
                </WhatsAppEditorProvider>
            </div>
        </TicketThreadContainer>
    )
}
