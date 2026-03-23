import React, { useContext } from 'react'

import { Box, Button, Text } from '@gorgias/axiom'

import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../../../ShopifyCustomerContext'
import { useOrderFieldPreferences } from '../../widget/useOrderFieldPreferences'
import type { Address } from '../addressUtils'
import { getAddressParts } from '../addressUtils'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    billingAddress: Address | null | undefined
}

export function BillingAddressSection({ billingAddress }: Props) {
    const { dispatchNotification } = useContext(ShopifyCustomerContext)
    const { preferences } = useOrderFieldPreferences()

    const sectionPrefs = preferences.sections.billingAddress
    if (sectionPrefs?.sectionVisible === false) return null

    if (!billingAddress) return null

    const addressParts = getAddressParts(billingAddress)

    function handleCopyToClipboard() {
        navigator.clipboard.writeText(addressParts.join('\n'))
        dispatchNotification({
            status: NotificationStatus.Success,
            message: 'Address copied to clipboard',
        })
    }

    return (
        <Box className={css.section} p="sm" display="block">
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
                        size="sm"
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
