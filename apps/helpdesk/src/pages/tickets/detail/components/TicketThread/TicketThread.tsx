import { useCallback, useMemo } from 'react'

import { useSearchParams } from '@repo/routing'
import {
    TicketThreadContainer,
    TicketThreadItem,
    TicketThreadItemsContainer,
    useTicketThread,
} from '@repo/ticket-thread'
import { TicketSearchParamsKeys } from '@repo/tickets/utils/routing'
import { useParams } from 'react-router-dom'

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

const { key, parse } = TicketSearchParamsKeys.showTicketEvents
export function TicketThread({ submit }: TicketThreadProps) {
    const dispatch = useAppDispatch()
    const ticketState = useAppSelector(getTicketState)
    const { ticketId } = useParams<{ ticketId: string }>()
    const [searchParams] = useSearchParams()

    const ticket = useAppSelector(getTicket)
    const initialMacroFilters = useInitialMacroFilters()
    const isShopperTyping = useMemo(
        () => ticketState.getIn(['_internal', 'isShopperTyping']) as boolean,
        [ticketState],
    )
    const pendingMessages = useMemo(
        () =>
            ticketState.getIn(['_internal', 'pendingMessages'])?.toJS?.() ?? [],
        [ticketState],
    )
    const showTicketEvents = useMemo(
        () => parse(searchParams.get(key)),
        [searchParams],
    )

    const { ticketThreadItems } = useTicketThread({
        ticketId: Number(ticketId),
        showTicketEvents,
        pendingMessages,
    })
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
            <TicketThreadItemsContainer>
                {ticketThreadItems.map((item, index) => (
                    <TicketThreadItem
                        key={`${item._tag}-${index}`}
                        item={item}
                    />
                ))}
            </TicketThreadItemsContainer>
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
