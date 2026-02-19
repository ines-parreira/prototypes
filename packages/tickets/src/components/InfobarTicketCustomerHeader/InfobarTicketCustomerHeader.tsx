import { useCallback } from 'react'

import { Link } from 'react-router-dom'

import {
    Box,
    Button,
    ButtonSize,
    ButtonVariant,
    Heading,
    IconName,
    Menu,
    MenuItem,
    MenuSection,
} from '@gorgias/axiom'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import css from './InfobarTicketCustomerHeader.less'

export interface InfobarTicketCustomerHeaderProps {
    customer?: TicketCustomer
    onOpenMergePanel?: () => void
    onEditCustomer: (customer: TicketCustomer) => void
    onSyncToShopify: (customer: TicketCustomer) => void
    hasShopifyIntegration?: boolean
}

export function InfobarTicketCustomerHeader({
    customer,
    onOpenMergePanel,
    onEditCustomer,
    onSyncToShopify,
    hasShopifyIntegration = false,
}: InfobarTicketCustomerHeaderProps) {
    const handleActionSelect = useCallback(
        (action: 'edit' | 'sync') => {
            if (!customer) return

            switch (action) {
                case 'edit':
                    onEditCustomer(customer as TicketCustomer)
                    break
                case 'sync':
                    onSyncToShopify(customer as TicketCustomer)
                    break
            }
        },
        [customer, onEditCustomer, onSyncToShopify],
    )

    if (!customer) {
        return null
    }

    const customerDisplayName = customer.name || `Customer #${customer.id}`

    return (
        <Box
            justifyContent="space-between"
            alignItems="center"
            className={css.container}
        >
            <Link to={`/app/customer/${customer.id}`}>
                <Heading size="sm">{customerDisplayName}</Heading>
            </Link>
            <Menu
                aria-label="Customer actions"
                trigger={
                    <Button
                        slot="button"
                        variant={ButtonVariant.Tertiary}
                        size={ButtonSize.Sm}
                        aria-label="Customer menu"
                        icon={IconName.DotsMeatballsHorizontal}
                    />
                }
                placement="bottom right"
            >
                <MenuSection id="customer-profile-actions">
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
                </MenuSection>
                <MenuSection id="customer-actions">
                    <MenuItem
                        label="Merge or switch customer"
                        leadingSlot={IconName.UserArrow}
                        onAction={onOpenMergePanel}
                    />
                </MenuSection>
            </Menu>
        </Box>
    )
}
