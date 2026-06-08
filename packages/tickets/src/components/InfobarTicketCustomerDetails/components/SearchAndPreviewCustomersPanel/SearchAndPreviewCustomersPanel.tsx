import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

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
    onMergeCustomer?: (customer: Customer) => void
    previewedCustomer?: Customer | null
    currentCustomerId?: number | null
    setCustomerLabel?: string
}

export function SearchAndPreviewCustomersPanel({
    isOpen,
    onClose,
    onSetCustomer,
    onMergeCustomer,
    previewedCustomer,
    currentCustomerId,
    setCustomerLabel = 'Switch customer',
}: SearchCustomersPanelProps) {
    const wasOpenRef = useRef(isOpen)
    const hasPendingResetRef = useRef(false)
    const [mode, setMode] = useState<'search' | 'preview'>('search')
    const [previewCustomer, setPreviewCustomer] = useState<Customer | null>(
        null,
    )

    const {
        searchTerm,
        setSearchTerm,
        clearSearch,
        registerResultSelection,
        isSearchMode,
        searchResults,
        isSearching,
        searchError,
    } = useCustomerSearch()

    const resetPanelState = useCallback(() => {
        hasPendingResetRef.current = false
        setPreviewCustomer(null)
        clearSearch()
        setMode('search')
    }, [clearSearch])

    useEffect(() => {
        const wasOpen = wasOpenRef.current
        wasOpenRef.current = isOpen

        if (isOpen) {
            if (hasPendingResetRef.current) {
                resetPanelState()
            }

            return
        }

        if (!wasOpen) {
            return
        }

        hasPendingResetRef.current = true

        // Switching immediately after closing the panel causes a bug
        // where the whole screen is not clickable.
        // This is most likely due to the panel width changing depending on the mode
        // which triggers a layout glitch within the SidePanel or underlying components,
        // so we wait for the transition to finish before resetting state.
        const resetTimeoutId = window.setTimeout(() => {
            resetPanelState()
        }, Duration.millis(250))

        return () => {
            window.clearTimeout(resetTimeoutId)
        }
    }, [isOpen, resetPanelState])

    const handlePreviewCustomer = useCallback((customer: Customer) => {
        setPreviewCustomer(customer)
        setMode('preview')
    }, [])

    const handleResultSelection = useCallback(
        (customer: Customer, index: number) => {
            if (customer.id) {
                registerResultSelection(customer.id, index)
            }
        },
        [registerResultSelection],
    )

    const handleClose = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                onClose()
            }
        },
        [onClose],
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
                                leadingSlot="magnifying-glass"
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </Box>
                        {searchError && (
                            <Text size="sm" color="content-error-default">
                                <InfoSection
                                    icon="warning-triangle"
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
                                    description={
                                        onMergeCustomer
                                            ? 'Search to find customers to merge or reassign to this ticket.'
                                            : 'Search to find customers to reassign to this ticket.'
                                    }
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
                                    onSetCustomer={onSetCustomer}
                                    onPreviewCustomer={handlePreviewCustomer}
                                    onMergeCustomer={onMergeCustomer}
                                    setCustomerLabel={setCustomerLabel}
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
                                    {searchResults.map((data, index) => (
                                        <CustomerListItem
                                            key={data.entity?.id}
                                            customer={data}
                                            isCurrent={
                                                !!currentCustomerId &&
                                                data.entity?.id ===
                                                    currentCustomerId
                                            }
                                            isDuplicate={
                                                !!previewedCustomer?.id &&
                                                data.entity?.id ===
                                                    previewedCustomer.id
                                            }
                                            onPreviewCustomer={(customer) => {
                                                handleResultSelection(
                                                    customer,
                                                    index,
                                                )
                                                handlePreviewCustomer(customer)
                                            }}
                                            onMergeCustomer={
                                                onMergeCustomer
                                                    ? (customer) => {
                                                          handleResultSelection(
                                                              customer,
                                                              index,
                                                          )
                                                          onMergeCustomer(
                                                              customer,
                                                          )
                                                      }
                                                    : undefined
                                            }
                                            onSetCustomer={(customer) => {
                                                handleResultSelection(
                                                    customer,
                                                    index,
                                                )
                                                onSetCustomer(customer)
                                            }}
                                            setCustomerLabel={setCustomerLabel}
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
                onSetCustomer={onSetCustomer}
                onMergeCustomer={onMergeCustomer}
                setCustomerLabel={setCustomerLabel}
                isCurrent={
                    !!currentCustomerId &&
                    previewCustomer?.id === currentCustomerId
                }
            />
        )
    }, [
        onSetCustomer,
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
        setCustomerLabel,
        currentCustomerId,
        handleResultSelection,
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
