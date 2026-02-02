import { useCallback, useMemo, useState } from 'react'

import {
    Box,
    Button,
    ListItem,
    Modal,
    MultiSelectField,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
} from '@gorgias/axiom'

import type { StoreIntegrationItem } from '../../shared/DuplicateGuidance/types'
import { useStoresWithCompletedSetup } from '../../shared/DuplicateGuidance/useStoresWithCompletedSetup'
import { useDuplicateModal } from './useDuplicateModal'

export const KnowledgeEditorGuidanceDuplicateModal = () => {
    const { isOpen, isDuplicating, shopName, onClose, onDuplicate } =
        useDuplicateModal()
    const storeIntegrations = useStoresWithCompletedSetup()

    const [selectedStores, setSelectedStores] = useState<
        StoreIntegrationItem[]
    >([])
    const [resetKey, setResetKey] = useState(0)

    const items: StoreIntegrationItem[] = useMemo(
        () =>
            storeIntegrations.map((item, idx) => ({
                id: String(idx),
                name: item.name,
            })),
        [storeIntegrations],
    )

    const storeItems = useMemo(() => {
        const sortedItems = [...items].sort((a, b) => {
            const isACurrent = a.name === shopName
            const isBCurrent = b.name === shopName
            if (isACurrent && !isBCurrent) return -1
            if (!isACurrent && isBCurrent) return 1
            return 0
        })

        return sortedItems.map((item) =>
            item.name === shopName
                ? { ...item, name: `${item.name} (current)` }
                : item,
        )
    }, [items, shopName])

    const isApplyDisabled = selectedStores.length === 0 || isDuplicating

    const handleApply = useCallback(async () => {
        await onDuplicate(selectedStores)
        setSelectedStores([])
        setResetKey((prev) => prev + 1)
    }, [onDuplicate, selectedStores])

    const handleClose = useCallback(() => {
        setSelectedStores([])
        setResetKey((prev) => prev + 1)
        onClose()
    }, [onClose])

    return (
        <Modal isOpen={isOpen} onOpenChange={handleClose} size="sm">
            <OverlayHeader title="Duplicate guidance" />
            <OverlayContent width="100%">
                <Box paddingBottom="md" width="100%">
                    <MultiSelectField<StoreIntegrationItem>
                        key={resetKey}
                        label="Duplicate to"
                        maxHeight={206}
                        isSearchable
                        items={storeItems}
                        onChange={setSelectedStores}
                        value={selectedStores}
                        placeholder="Select stores"
                        shouldFlip={false}
                    >
                        {(option: StoreIntegrationItem) => (
                            <ListItem key={option.id} label={option.name} />
                        )}
                    </MultiSelectField>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={handleClose}
                        isDisabled={isDuplicating}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleApply}
                        isDisabled={isApplyDisabled}
                        isLoading={isDuplicating}
                    >
                        Duplicate
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
