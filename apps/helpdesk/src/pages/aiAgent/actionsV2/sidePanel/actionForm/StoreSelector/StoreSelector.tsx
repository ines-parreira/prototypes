import { useEffect } from 'react'

import { ListItem, SelectField } from '@gorgias/axiom'

import { ProviderIcon } from '../../shared/ProviderIcon'
import type { Store } from '../../types'

type Props = {
    stores: Store[]
    selectedStoreId: string | null
    onSelect: (storeId: string) => void
    label?: string
    isRequired?: boolean
    placeholder?: string
}

export const StoreSelector = ({
    stores,
    selectedStoreId,
    onSelect,
    label = 'Store',
    isRequired = true,
    placeholder = 'Select a store',
}: Props) => {
    useEffect(() => {
        if (stores.length === 1 && !selectedStoreId) {
            onSelect(stores[0].id)
        }
    }, [stores, selectedStoreId, onSelect])

    const selected = stores.find((store) => store.id === selectedStoreId)

    return (
        <SelectField
            label={label}
            isRequired={isRequired}
            placeholder={placeholder}
            items={stores}
            value={selected}
            leadingSlot={
                selected?.iconUrl ? (
                    <ProviderIcon
                        iconUrl={selected.iconUrl}
                        alt={selected.name}
                        size="sm"
                    />
                ) : undefined
            }
            onChange={(store: Store) => onSelect(store.id)}
        >
            {(store: Store) => (
                <ListItem
                    key={store.id}
                    id={store.id}
                    label={store.name}
                    leadingSlot={
                        store.iconUrl ? (
                            <ProviderIcon
                                iconUrl={store.iconUrl}
                                alt={store.name}
                                size="sm"
                            />
                        ) : undefined
                    }
                />
            )}
        </SelectField>
    )
}
