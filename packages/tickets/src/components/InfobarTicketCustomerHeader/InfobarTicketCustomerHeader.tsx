import { useCallback } from 'react'

import { Link, useParams } from 'react-router-dom'

import {
    Box,
    Button,
    ButtonSize,
    ButtonVariant,
    Heading,
    IconName,
    Menu,
    MenuItem,
} from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { useGetTicketData } from '../InfobarTicketDetails/components/InfobarTicketDetailsTags/hooks/useGetTicketData'

import css from './InfobarTicketCustomerHeader.less'

export interface InfobarTicketCustomerHeaderProps {
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
    showMergeButton?: boolean
    onMergeClick?: () => void
}

export function InfobarTicketCustomerHeader({
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
    showMergeButton = false,
    onMergeClick,
}: InfobarTicketCustomerHeaderProps) {
    const { ticketId } = useParams<{ ticketId: string }>()

    const { data: ticket } = useGetTicketData(ticketId)

    const customer = ticket?.data?.customer

    const handleActionSelect = useCallback(
        (action: 'edit' | 'sync') => {
            if (!customer) return

            switch (action) {
                case 'edit':
                    onEditCustomer(customer)
                    break
                case 'sync':
                    onSyncToShopify(customer)
                    break
            }
        },
        [customer, onEditCustomer, onSyncToShopify],
    )

    if (!ticketId || !customer) {
        return null
    }

    const customerDisplayName = customer.name || `Customer #${customer.id}`

    return (
        <div className={css.container}>
            <Box justifyContent="space-between">
                <Link to={`/app/customer/${customer.id}`}>
                    <Heading size="sm">{customerDisplayName}</Heading>
                </Link>
                <Box>
                    {showMergeButton && (
                        <Button
                            variant={ButtonVariant.Tertiary}
                            size={ButtonSize.Sm}
                            aria-label="Merge customer profiles"
                            icon={IconName.ArrowMerging}
                            onClick={onMergeClick}
                        />
                    )}
                    <Menu
                        aria-label="Customer actions"
                        trigger={
                            <Button
                                slot="button"
                                variant={ButtonVariant.Tertiary}
                                size={ButtonSize.Sm}
                                aria-label="Customer menu"
                                icon={IconName.DotsKebabVertical}
                            />
                        }
                        placement="bottom right"
                    >
                        <MenuItem
                            label="Edit Customer"
                            leadingSlot={IconName.EditPencil}
                            onAction={() => {
                                handleActionSelect('edit')
                            }}
                        />
                        {hasShopifyIntegration && (
                            <MenuItem
                                label="Sync profile to Shopify"
                                leadingSlot={IconName.VendorShopifyColored}
                                onAction={() => {
                                    handleActionSelect('sync')
                                }}
                            />
                        )}
                    </Menu>
                </Box>
            </Box>
        </div>
    )
}
