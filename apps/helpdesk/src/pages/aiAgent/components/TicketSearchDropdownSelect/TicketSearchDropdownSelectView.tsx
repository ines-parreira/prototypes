import { useCallback, useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import type {
    Ticket,
    TicketsSearchListDataItem,
} from '@gorgias/helpdesk-client'
import { getTicket } from '@gorgias/helpdesk-client'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useSearchTickets } from 'models/aiAgent/queries'

import { TicketSearchDropdownSelectComponent } from './TicketSearchDropdownSelectComponent'

type Props = {
    onSelect: (ticket: Ticket) => void
    className?: string
    baseSearchTerm?: string
    isDisabled?: boolean
}

// Type for the search result item - based on the actual API response structure
type SearchTicketItem = {
    id: number
    subject: string
    customer?: {
        id: number
        name?: string
        email?: string
    }
}

export const TicketSearchDropdownSelectView = ({
    className,
    onSelect,
    baseSearchTerm,
    isDisabled,
}: Props) => {
    const [searchTerm, setSearchTerm] = useState(baseSearchTerm ?? '')
    const [isSelected, setIsSelected] = useState(!!baseSearchTerm)
    const [isTyping, setIsTyping] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const [isLoadingFullTicket, setIsLoadingFullTicket] = useState(false)

    const {
        isLoading,
        error,
        isRefetching,
        isRefetchError,
        data,
        refetch: ticketSearchRefetch,
    } = useSearchTickets({ query: searchTerm }, { enabled: false })

    const isDropdownLoading =
        (isLoading || isRefetching || isTyping) && searchTerm.length > 0

    const isTicketListAvailable =
        (data && !isRefetching && !isTyping && !isLoading) ?? false

    const isDropdownVisible =
        (isDropdownLoading || isTicketListAvailable) && !isSelected

    const handleTicketSearch = (value: string) => {
        setIsSelected(false)
        setIsTyping(true)
        setSearchTerm(value)
    }

    const handleTicketSelect = useCallback(
        async (ticketId: number) => {
            const searchResults = (data?.data?.data ??
                []) as TicketsSearchListDataItem[]
            const pickedTicket = searchResults.find(
                (ticket) => ticket.id === ticketId,
            )

            setIsSelected(true)
            setSearchTerm(pickedTicket?.subject || '')

            if (pickedTicket) {
                try {
                    setIsLoadingFullTicket(true)
                    const { data: fullTicket } = await getTicket(ticketId)
                    onSelect(fullTicket)
                } catch (error) {
                    reportError(error, {
                        tags: { team: SentryTeam.AI_AGENT },
                    })
                } finally {
                    setIsLoadingFullTicket(false)
                }
            }
        },
        [data, onSelect],
    )

    useEffect(() => {
        if (searchTerm && !isSelected) {
            setIsTyping(true)
            const handler = setTimeout(async () => {
                setIsTyping(false)
                await ticketSearchRefetch()
            }, 1000)

            return () => {
                clearTimeout(handler)
            }
        }
    }, [searchTerm, ticketSearchRefetch, isSelected])

    useEffect(() => {
        if (error || isRefetchError) {
            reportError(error || isRefetchError, {
                tags: { team: SentryTeam.AI_AGENT },
            })
        }
    }, [error, isRefetchError])

    // Cast the search results to the expected structure for the component
    const ticketList = ((data as any)?.data?.data as SearchTicketItem[]) ?? []

    return (
        <TicketSearchDropdownSelectComponent
            ticketList={ticketList}
            onSearch={handleTicketSearch}
            onSelect={handleTicketSelect}
            searchTerm={searchTerm}
            isDropdownVisible={isDropdownVisible}
            isDropdownLoading={isDropdownLoading || isLoadingFullTicket}
            isTicketListAvailable={isTicketListAvailable}
            focusedIndex={focusedIndex}
            setFocusedIndex={setFocusedIndex}
            className={className}
            isDisabled={isDisabled}
        />
    )
}
