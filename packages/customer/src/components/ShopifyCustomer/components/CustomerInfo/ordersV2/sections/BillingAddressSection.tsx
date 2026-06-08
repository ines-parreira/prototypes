import React from 'react'

import { Box, Button, Text, toast } from '@gorgias/axiom'

import type { Address } from '../../orders/addressUtils'
import { getAddressParts } from '../../orders/addressUtils'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'

type Props = {
    billingAddress: Address | null | undefined
}

export function BillingAddressSection({ billingAddress }: Props) {
    const { preferences } = useOrderFieldPreferences()

    const sectionPrefs = preferences.sections.billingAddress
    if (sectionPrefs?.sectionVisible === false) return null

    if (!billingAddress) return null

    const addressParts = getAddressParts(billingAddress)

    function handleCopyToClipboard() {
        navigator.clipboard.writeText(addressParts.join('\n'))
        toast.success('Address copied to clipboard')
    }

    return (
        <Box display="block" pt="sm" pb="sm">
            <Box
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                mb="xs"
            >
                <Text size="md" variant="bold">
                    Billing address
                </Text>
                <Box flexDirection="row" gap="xxxs">
                    <Button
                        as="button"
                        icon="copy"
                        intent="regular"
                        variant="tertiary"
                        onClick={handleCopyToClipboard}
                        aria-label="Copy billing address to clipboard"
                    />
                </Box>
            </Box>
            {addressParts.map((part, index) => (
                <React.Fragment key={index}>
                    <Text size="md">{part}</Text>
                    <br />
                </React.Fragment>
            ))}
        </Box>
    )
}
