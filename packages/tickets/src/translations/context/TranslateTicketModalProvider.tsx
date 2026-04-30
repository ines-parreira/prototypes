import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { useParams } from 'react-router-dom'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { TranslateTicketModal } from '../components/TranslateTicketModal'
import { TranslateTicketModalContext } from './TranslateTicketModalContext'

type TranslateTicketModalProviderProps = {
    children: ReactNode
}

export function TranslateTicketModalProvider({
    children,
}: TranslateTicketModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { ticketId: ticketIdParam } = useParams<{ ticketId?: string }>()
    const ticketId = ticketIdParam ? Number(ticketIdParam) : null
    const { data: ticketData, isLoading: isLoadingTicket } = useGetTicket(
        ticketId!,
        undefined,
        {
            query: {
                enabled: isOpen && ticketId !== null,
            },
        },
    )

    const openTranslateTicketModal = useCallback(() => {
        if (ticketId === null) {
            return
        }

        setIsOpen(true)
    }, [ticketId])

    const value = useMemo(
        () => ({
            openTranslateTicketModal,
        }),
        [openTranslateTicketModal],
    )

    return (
        <TranslateTicketModalContext.Provider value={value}>
            {children}
            {ticketId !== null && (
                <TranslateTicketModal
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    ticketId={ticketId}
                    isLoading={isLoadingTicket}
                    ticketLanguage={ticketData?.data?.language}
                    ticketMessages={ticketData?.data?.messages ?? []}
                />
            )}
        </TranslateTicketModalContext.Provider>
    )
}
