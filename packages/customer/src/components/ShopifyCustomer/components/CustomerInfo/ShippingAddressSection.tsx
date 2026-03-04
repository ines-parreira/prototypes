import React, { useContext, useState } from 'react'
import type { ReactNode } from 'react'

import { Box, Button, Text } from '@gorgias/axiom'

import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../ShopifyCustomerContext'

import css from './OrderSidePanelPreview.less'

export type ShippingAddress = {
    name: string
    address1?: string | null
    address2?: string | null
    city?: string | null
    province_code?: string | null
    country_code: string
    zip?: string | null
}

export type EditShippingAddressModalRenderProps = {
    isOpen: boolean
    orderId: string
    customerId: string
    integrationId: number | undefined
    currentShippingAddress: Record<string, unknown>
    onClose: () => void
    onSuccess: (newAddress: Record<string, unknown>) => void
}

type Props = {
    shippingAddress: ShippingAddress | null | undefined
    onEdit?: () => void
    orderId?: string
    customerId?: string
    integrationId?: number
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
}

function getShippingAddressParts(address: ShippingAddress): string[] {
    const cityLine =
        [address.city, address.province_code].filter(Boolean).join(', ') + ','

    return [
        address.name,
        address.address1 ? `${address.address1},` : null,
        address.address2 ? `${address.address2},` : null,
        cityLine,
        `${address.country_code} ${address.zip ?? ''}`.trim(),
    ].filter(Boolean) as string[]
}

export function ShippingAddressSection({
    shippingAddress,
    onEdit,
    orderId,
    customerId,
    integrationId,
    renderEditShippingAddressModal,
}: Props) {
    const { dispatchNotification } = useContext(ShopifyCustomerContext)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [shippingAddressOverride, setShippingAddressOverride] = useState<
        ShippingAddress | undefined
    >(undefined)

    if (!shippingAddress) return null

    const displayedAddress = shippingAddressOverride ?? shippingAddress
    const addressParts = getShippingAddressParts(displayedAddress)

    function handleCopyToClipboard() {
        navigator.clipboard.writeText(addressParts.join('\n'))
        dispatchNotification({
            status: NotificationStatus.Success,
            message: 'Address copied to clipboard',
        })
    }

    function handleEditClick() {
        if (renderEditShippingAddressModal) {
            setIsEditModalOpen(true)
        } else {
            onEdit?.()
        }
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
                    Shipping address
                </Text>
                <Box flexDirection="row" gap="xxxs">
                    <Button
                        as="button"
                        icon="copy"
                        intent="regular"
                        size="sm"
                        variant="tertiary"
                        onClick={handleCopyToClipboard}
                        aria-label="Copy to clipboard"
                    />
                    <Button
                        as="button"
                        icon="edit"
                        intent="regular"
                        size="sm"
                        variant="tertiary"
                        onClick={handleEditClick}
                        aria-label="Edit shipping address"
                    />
                </Box>
            </Box>
            {addressParts.map((part, index) => (
                <React.Fragment key={index}>
                    <Text key={index} size="md">
                        {part}
                    </Text>
                    <br />
                </React.Fragment>
            ))}
            {renderEditShippingAddressModal &&
                renderEditShippingAddressModal({
                    isOpen: isEditModalOpen,
                    orderId: orderId ?? '',
                    customerId: customerId ?? '',
                    integrationId,
                    currentShippingAddress: displayedAddress as Record<
                        string,
                        unknown
                    >,
                    onClose: () => setIsEditModalOpen(false),
                    onSuccess: (newAddress: Record<string, unknown>) => {
                        setShippingAddressOverride({
                            ...displayedAddress,
                            ...newAddress,
                            name: `${newAddress.first_name ?? ''} ${newAddress.last_name ?? ''}`.trim(),
                            province_code: newAddress.province as
                                | string
                                | null
                                | undefined,
                        } as ShippingAddress)
                    },
                })}
        </Box>
    )
}
