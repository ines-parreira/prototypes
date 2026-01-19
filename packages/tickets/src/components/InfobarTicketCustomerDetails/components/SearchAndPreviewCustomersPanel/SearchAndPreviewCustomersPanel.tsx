import { useCallback, useMemo, useState } from 'react'

import {
    Box,
    OverlayContent,
    OverlayHeader,
    SidePanel,
    Text,
    TextField,
} from '@gorgias/axiom'
import type { Customer } from '@gorgias/helpdesk-types'

import { CustomerListItem } from '../CustomerListItem/CustomerListItem'
import { CustomerPreview } from './components/CustomerPreview'

import css from './SearchAndPreviewCustomersPanel.less'

export type Mode = 'search' | 'preview'
export type SearchCustomersPanelProps = {
    isOpen: boolean
    onClose: () => void
    onSetCustomer: (customer: Customer) => void
    previewedCustomer?: Customer | null
}

export function SearchAndPreviewCustomersPanel({
    isOpen,
    onClose,
    onSetCustomer,
    previewedCustomer,
}: SearchCustomersPanelProps) {
    const [mode, setMode] = useState<'search' | 'preview'>('search')
    const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(
        null,
    )

    const handleSetCustomer = useCallback(
        (customer: Customer) => {
            onSetCustomer(customer)
            onClose()
        },
        [onSetCustomer, onClose],
    )

    const handlePreviewCustomer = useCallback((customer: Customer) => {
        setPreviewCustomer(customer)
        setMode('preview')
    }, [])

    const handleClose = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                onClose()
                // Switching immediately after closing the panel causes a bug
                // where the whole screen is not clickable.
                // This is most likely due to the panel width changing depending on the mode
                // which triggers a layout glitch within the SidePanel or underlying components,
                // so we wait for the transition to finish (200ms + 50ms buffer)
                setTimeout(() => {
                    setMode('search')
                }, 250)
            }
        },
        [onClose],
    )

    const content = useMemo(() => {
        return mode === 'search' ? (
            <>
                <OverlayHeader title="Search customers" />
                <OverlayContent>
                    <Box flexDirection="column" gap="sm">
                        <TextField
                            placeholder="Search by name, email or order no."
                            leadingSlot="search-magnifying-glass"
                        />
                        {previewedCustomer && (
                            <>
                                <Text size="sm" className={css.description}>
                                    Another profile looks similar to this one.
                                    Click to view profile or search for other
                                    customers.
                                </Text>
                                <CustomerListItem
                                    customer={previewedCustomer}
                                    isDuplicate
                                    onSetCustomer={handleSetCustomer}
                                    onPreviewCustomer={handlePreviewCustomer}
                                />
                            </>
                        )}
                    </Box>
                </OverlayContent>
            </>
        ) : (
            <CustomerPreview
                customer={previewCustomer}
                onGoBack={() => setMode('search')}
                onClose={() => {
                    handleClose(false)
                }}
                onSwitchCustomer={handleSetCustomer}
            />
        )
    }, [
        handleSetCustomer,
        handlePreviewCustomer,
        handleClose,
        previewedCustomer,
        previewCustomer,
        mode,
    ])

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={handleClose}
            isDismissable={true}
            size={mode === 'search' ? 'sm' : 'md'}
        >
            {content}
        </SidePanel>
    )
}
