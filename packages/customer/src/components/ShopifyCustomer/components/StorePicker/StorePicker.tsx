import type { RefObject } from 'react'
import { useCallback, useMemo, useState } from 'react'

import {
    Button,
    ListFooter,
    ListItem,
    Select,
    SelectTrigger,
    Text,
    TextField,
} from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

type Props = {
    integrations: Integration[]
    selectedIntegrationId?: number
    onChange: (integration: Integration) => void
    isLoading?: boolean
    isDisabled?: boolean
    placeholder?: string
    onSyncProfile?: () => void
}

export function StorePicker({
    integrations,
    selectedIntegrationId,
    onChange,
    isLoading = false,
    onSyncProfile,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenChange = useCallback((newIsOpen: boolean) => {
        setIsOpen(newIsOpen)
    }, [])

    const handleSyncClick = useCallback(() => {
        setIsOpen(false)
        onSyncProfile?.()
    }, [onSyncProfile])

    const handleSelect = useCallback(
        (store: Integration) => {
            onChange(store)
        },
        [onChange],
    )

    const selectedIntegration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === selectedIntegrationId,
            ),
        [integrations, selectedIntegrationId],
    )

    const trigger = useCallback(
        ({
            isOpen,
            ref,
            selectedText,
        }: {
            isOpen: boolean
            ref?: RefObject<HTMLButtonElement>
            selectedText: string
        }) => (
            <SelectTrigger>
                <TextField
                    aria-label="Select a store"
                    inputRef={ref as RefObject<HTMLInputElement>}
                    isFocused={isOpen}
                    trailingSlot={
                        isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'
                    }
                    value={selectedText}
                    leadingSlot={
                        selectedIntegrationId
                            ? 'vendor-shopify-colored'
                            : undefined
                    }
                />
            </SelectTrigger>
        ),
        [selectedIntegrationId],
    )

    return (
        <Select<Integration>
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            items={integrations}
            selectedItem={selectedIntegration}
            onSelect={handleSelect}
            aria-label="Select a store"
            isDisabled={isLoading}
            isSearchable
            trigger={trigger}
            footer={
                onSyncProfile && (
                    <ListFooter>
                        <Button
                            size="sm"
                            variant="tertiary"
                            leadingSlot="add-plus"
                            onClick={handleSyncClick}
                        >
                            <Text variant="bold">Sync to other stores</Text>
                        </Button>
                    </ListFooter>
                )
            }
        >
            {(store) => (
                <ListItem
                    id={store.id}
                    leadingSlot="vendor-shopify-colored"
                    label={store.name}
                    textValue={store.name}
                />
            )}
        </Select>
    )
}
