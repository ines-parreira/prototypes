import { TicketChannel } from 'business/types/ticket'
import {
    PickedCustomerWithHighlights,
    PickedTicketWithHighlights,
    PicketVoiceCallWithHighlights,
} from 'models/search/types'

export const HIGHLIGHT_TAG = '<em>'
const DEFAULT_HIGHLIGHT_TRIM_LENGTH = 15

const getCustomer = (
    item: { id: number; name: string; email: string | null },
    sender?: {
        name?: string[]
        address?: string[]
    },
    recipient?: {
        name?: string[]
        address?: string[]
    },
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

export const ticketHighlightsTransform = (item: PickedTicketWithHighlights) => {
    const { highlights, ...rest } = item
    if (highlights === undefined) {
        return {
            ...rest,
            customer:
                item.customer.name ||
                item.customer.email ||
                `Customer #${item.customer.id}`,
            title: item.subject || item.excerpt || '',
            message: undefined,
            ticketId: undefined,
        }
    }

    const customer = getCustomer(
        item.customer,
        highlights?.messages?.from,
        highlights?.messages?.to,
    )

    return {
        ...rest,
        customer: customer,
        title: highlights.subject?.[0] || item.subject || '',
        message: highlights.messages?.body?.[0] || item.excerpt || '',
        ticketId: highlights.id?.[0]
            ? `Ticket ID: ${highlights.id[0]}`
            : undefined,
    }
}

export const customerHighlightsTransform = (
    item: PickedCustomerWithHighlights,
) => {
    const highlights = item?.highlights
    const phoneNumber = item.channels.find(
        (channel) => channel.type === TicketChannel.Phone,
    )?.address

    const phoneNumberOrAddress =
        highlights?.channels?.address?.[0] ?? phoneNumber

    return {
        id: item.id,
        email: highlights?.email?.[0] ?? item.email,
        name: highlights?.name?.[0] ?? item.name,
        phoneNumberOrAddress,
        orderId: highlights?.order_ids?.[0]
            ? `Order ID: ${highlights?.order_ids[0]}`
            : undefined,
    }
}

export const callHighlightsTransform = (
    item: PicketVoiceCallWithHighlights,
) => {
    const highlights = item.highlights

    const sourcePhoneNumber =
        highlights?.phone_number_source?.[0] ?? item.phone_number_source
    const destinationPhoneNumber =
        highlights?.phone_number_destination?.[0] ??
        item.phone_number_destination

    return {
        ...item,
        phone_number_source: sourcePhoneNumber,
        phone_number_destination: destinationPhoneNumber,
        highlightedText: highlights?.transcripts?.[0],
    }
}

export const trimWithEllipsisBeforeTheHighlight = (
    highlight: string,
    charactersToTrim = DEFAULT_HIGHLIGHT_TRIM_LENGTH,
) => {
    const firstHighlightPosition = highlight
        .toLowerCase()
        .indexOf(HIGHLIGHT_TAG)
    if (firstHighlightPosition > charactersToTrim) {
        return `...${highlight.substring(
            firstHighlightPosition -
                Math.min(firstHighlightPosition, charactersToTrim),
            highlight.length,
        )}`
    }

    return highlight
}
