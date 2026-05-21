import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import {
    Box,
    Button,
    Heading,
    Modal,
    MultiSelectField,
    MultiSelectItem,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import type { StoreIntegration } from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { IntegrationIcon } from 'pages/common/components/IntegrationIcon/IntegrationIcon'

// TODO: extend SUPPORTED_STORE_TYPES once BigCommerce / Magento2 are wired up
// for the actions platform — backend needs to accept those types in the app
// install payload before we can offer them here.
const SUPPORTED_STORE_TYPES = [IntegrationType.Shopify]

const SEARCHABLE_THRESHOLD = 10

export interface ConnectAppModalApp {
    name: string
}

interface ConnectAppModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    app: ConnectAppModalApp
    onSubmit: (stores: StoreIntegration[]) => void | Promise<void>
    isSubmitting?: boolean
    disabledStoreIds?: ReadonlySet<number>
}

type StoreItem = {
    id: number
    name: string
    type: StoreIntegration['type']
}

export const ConnectAppModal = ({
    isOpen,
    onOpenChange,
    app,
    onSubmit,
    isSubmitting = false,
    disabledStoreIds,
}: ConnectAppModalProps) => {
    const storeIntegrations = useStoreIntegrations(SUPPORTED_STORE_TYPES)
    const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([])

    useEffect(() => {
        if (!isOpen) {
            setSelectedStoreIds([])
            return
        }
        if (
            storeIntegrations.length === 1 &&
            !disabledStoreIds?.has(storeIntegrations[0].id)
        ) {
            setSelectedStoreIds([storeIntegrations[0].id])
        }
    }, [isOpen, storeIntegrations, disabledStoreIds])

    useEffect(() => {
        if (!disabledStoreIds || disabledStoreIds.size === 0) return
        setSelectedStoreIds((prev) =>
            prev.filter((id) => !disabledStoreIds.has(id)),
        )
    }, [disabledStoreIds])

    const storeItems = useMemo<StoreItem[]>(
        () =>
            storeIntegrations.map((integration) => ({
                id: integration.id,
                name: integration.name,
                type: integration.type,
            })),
        [storeIntegrations],
    )

    const selectedStores = useMemo<StoreIntegration[]>(
        () =>
            storeIntegrations.filter((integration) =>
                selectedStoreIds.includes(integration.id),
            ),
        [storeIntegrations, selectedStoreIds],
    )

    const selectedItems = useMemo<StoreItem[]>(
        () => storeItems.filter((item) => selectedStoreIds.includes(item.id)),
        [storeItems, selectedStoreIds],
    )

    const requiresStoreSelection = storeIntegrations.length > 1
    const canSubmit =
        !isSubmitting &&
        selectedStoreIds.length > 0 &&
        storeIntegrations.length > 0

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!canSubmit) {
            return
        }
        await onSubmit(selectedStores)
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="sm"
            isDismissable={!isSubmitting}
        >
            <OverlayHeader
                title={
                    <Heading size="lg">
                        Almost there! Connect your store
                    </Heading>
                }
            />
            <OverlayContent display="block">
                <form
                    onSubmit={handleSubmit}
                    aria-label={`Connect ${app.name}`}
                >
                    <Box flexDirection="column" gap="md">
                        <Text>
                            {app.name} needs a connected store to sync orders
                            and run actions in AI Agent.
                        </Text>
                        {requiresStoreSelection && (
                            <MultiSelectField<StoreItem>
                                label="Store"
                                placeholder="Select stores"
                                items={storeItems}
                                value={selectedItems}
                                onChange={(items) =>
                                    setSelectedStoreIds(
                                        items.map((item) => item.id),
                                    )
                                }
                                isSearchable={
                                    storeIntegrations.length >
                                    SEARCHABLE_THRESHOLD
                                }
                                searchPlaceholder="Search stores"
                                isDisabled={isSubmitting}
                                isRequired
                                aria-label="Stores"
                                maxHeight={250}
                            >
                                {(item) => (
                                    <MultiSelectItem
                                        label={item.name}
                                        isDisabled={disabledStoreIds?.has(
                                            item.id,
                                        )}
                                        leadingSlot={
                                            <IntegrationIcon kind={item.type} />
                                        }
                                    />
                                )}
                            </MultiSelectField>
                        )}
                    </Box>
                </form>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box justifyContent="flex-end" width="100%">
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isDisabled={!canSubmit}
                        isLoading={isSubmitting}
                    >
                        Connect store
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
