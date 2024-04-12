import {TicketChannel} from 'business/types/ticket'
import {
    CustomerHighlights,
    CustomerWithHighlights,
    CustomerWithHighlightsResponse,
    PickedCustomer,
    TicketHighlights,
    TicketWithHighlights,
    TicketWithHighlightsResponse,
} from 'models/search/types'
import {ViewType} from 'models/view/types'
import {PickedTicket} from 'pages/common/components/Spotlight/SpotlightTicketRow'

const getCustomer = (
    item: {id: number; name: string; email: string | null},
    sender?: {
        name?: string[]
        address?: string[]
    },
    recipient?: {
        name?: string[]
        address?: string[]
    }
) => {
    const highlightedSenderName = sender?.name?.[0]
    const highlightedSenderAddress = sender?.address?.[0]

    const highlightedRecipientName = recipient?.name?.[0]
    const highlightedRecipientAddress = recipient?.address?.[0]

    if (highlightedSenderName || highlightedSenderAddress) {
        return highlightedSenderName || highlightedSenderAddress || ''
    }
    if (highlightedRecipientName || highlightedRecipientAddress) {
        return highlightedRecipientName || highlightedRecipientAddress || ''
    }

    return item.name || item.email || `Customer #${item.id}`
}

export const ticketHighlightsTransform = (
    item: PickedTicket,
    highlights?: TicketHighlights
) => {
    if (highlights === undefined) {
        return {
            ...item,
            customer:
                item.customer.name ||
                item.customer.email ||
                `Customer #${item.customer.id}`,
            title: item.subject || item.excerpt || '',
            message: undefined,
        }
    }

    const customer = getCustomer(
        item.customer,
        highlights?.messages?.from,
        highlights?.messages?.to
    )

    return {
        ...item,
        customer: customer,
        title: highlights.subject?.[0] || item.subject || '',
        message: highlights.messages?.body?.[0] || item.excerpt || '',
    }
}

export const customerHighlightsTransform = (
    highlight: CustomerHighlights | undefined,
    item: PickedCustomer
) => {
    const phoneNumber = item.channels.find(
        (channel) => channel.type === TicketChannel.Phone
    )?.address

    const phoneNumberOrAddress =
        highlight?.channels?.address?.[0] ?? phoneNumber

    return {
        id: item.id,
        email: highlight?.email?.[0] ?? item.email,
        name: highlight?.name?.[0] ?? item.name,
        phoneNumberOrAddress,
    }
}

type ResultWithHighlights<T> = T extends ViewType.TicketList
    ? TicketWithHighlights
    : T extends ViewType.CustomerList
    ? CustomerWithHighlights
    : never

export function getTypedHighlightResults<T extends ViewType>(
    data: TicketWithHighlightsResponse[] | CustomerWithHighlightsResponse[],
    viewType: T
): ResultWithHighlights<T>[] {
    const entityType = viewType === ViewType.TicketList ? 'Ticket' : 'Customer'
    return data
        .map((result) => ({
            type: entityType,
            ...result,
        }))
        .filter(
            (result) => result.type === entityType
        ) as ResultWithHighlights<T>[]
}
