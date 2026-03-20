import type { ReactNode } from 'react'

import parsePhoneNumber from 'libphonenumber-js'

import { Button, Text } from '@gorgias/axiom'

import goToTicket from 'common/utils/goToTicket'

type Props = {
    name: Maybe<string>
    phoneNumber: string
    ticketId?: number | null
    leadingSlot?: string | ReactNode
}

export default function PhoneCustomerName({
    name,
    phoneNumber,
    ticketId,
    leadingSlot,
}: Props): JSX.Element {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber)
    const formattedPhoneNumber = parsedPhoneNumber?.formatInternational()

    const displayedPhoneNumber = formattedPhoneNumber || phoneNumber

    const buttonContent = name ? (
        <>
            <Text variant="bold">{name}</Text>
            <Text variant="regular"> ({displayedPhoneNumber})</Text>
        </>
    ) : (
        displayedPhoneNumber
    )

    if (!ticketId) {
        return <span>{buttonContent}</span>
    }

    return (
        <Button
            variant="tertiary"
            leadingSlot={leadingSlot}
            trailingSlot={'arrow-chevron-right'}
            onClick={() => goToTicket(ticketId)}
        >
            {buttonContent}
        </Button>
    )
}
