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

import { useCustomerSearch } from '../../hooks/useCustomerSearch'
import { CustomerListItem } from '../CustomerListItem/CustomerListItem'
import { CustomerPreview } from './components/CustomerPreview'
import { InfoSection } from './components/InfoSection'

import css from './SearchAndPreviewCustomersPanel.less'

export type Mode = 'search' | 'preview'
export type SearchCustomersPanelProps = {
    isOpen: boolean
    onClose: () => void
    onSetCustomer: (customer: Customer) => void
    onMergeCustomer: (customer: Customer) => void
    previewedCustomer?: Customer | null
}

export function SearchAndPreviewCustomersPanel({
    isOpen,
    onClose,
    onSetCustomer,
    onMergeCustomer,
    previewedCustomer,
}: SearchCustomersPanelProps) {
    const [mode, setMode] = useState<'search' | 'preview'>('search')
    const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(
        null,
    )

    const {
        searchTerm,
        setSearchTerm,
        clearSearch,
        isSearchMode,
        searchResults,
        isSearching,
        searchError,
    } = useCustomerSearch()

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
                clearSearch()
            }
        },
        [onClose, clearSearch],
    )

    const content = useMemo(() => {
        return mode === 'search' ? (
            <>
                <OverlayHeader title="Search customers" />
                <OverlayContent>
                    <Box flexDirection="column" gap="sm" flexGrow={1}>
                        <Box marginBottom="xs">
                            <TextField
                                placeholder="Search by name, email or order no."
                                leadingSlot="search-magnifying-glass"
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </Box>
                        {searchError && (
                            <Text size="sm" color="content-error-default">
                                <InfoSection
                                    icon="triangle-warning"
                                    description="Failed to search customers. Please try again."
                                />
                            </Text>
                        )}
                        {isSearching && (
                            <InfoSection
                                icon="loader"
                                description="Searching customers..."
                            />
                        )}
                        {!isSearchMode &&
                            !isSearching &&
                            !previewedCustomer && (
                                <InfoSection
                                    icon="user"
                                    description="Search to find customers to merge or reassign to this ticket."
                                />
                            )}
                        {!isSearchMode && previewedCustomer && (
                            <>
                                <Text size="sm" className={css.infoText}>
                                    Another profile looks similar to this one.
                                    Click to view profile or search for other
                                    customers.
                                </Text>
                                <CustomerListItem
                                    customer={previewedCustomer}
                                    isDuplicate
                                    onSetCustomer={handleSetCustomer}
                                    onPreviewCustomer={handlePreviewCustomer}
                                    onMergeCustomer={onMergeCustomer}
                                />
                            </>
                        )}
                        {isSearchMode &&
                            !isSearching &&
                            !searchError &&
                            searchResults.length === 0 && (
                                <InfoSection
                                    icon="user"
                                    description="No customers found."
                                />
                            )}
                        {isSearchMode &&
                            !isSearching &&
                            searchResults.length > 0 && (
                                <Box flexDirection="column" gap="sm">
                                    <Text size="sm" className={css.infoText}>
                                        {searchResults.length === 1
                                            ? '1 result'
                                            : `${searchResults.length} results`}
                                    </Text>
                                    {searchResults.map((data) => (
                                        <CustomerListItem
                                            key={data.entity?.id}
                                            customer={data}
                                            onSetCustomer={handleSetCustomer}
                                            onPreviewCustomer={
                                                handlePreviewCustomer
                                            }
                                            onMergeCustomer={onMergeCustomer}
                                        />
                                    ))}
                                </Box>
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
                onSetCustomer={handleSetCustomer}
                onMergeCustomer={onMergeCustomer}
            />
        )
    }, [
        handleSetCustomer,
        handlePreviewCustomer,
        handleClose,
        previewedCustomer,
        previewCustomer,
        mode,
        searchTerm,
        setSearchTerm,
        isSearchMode,
        isSearching,
        searchResults,
        searchError,
        onMergeCustomer,
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
