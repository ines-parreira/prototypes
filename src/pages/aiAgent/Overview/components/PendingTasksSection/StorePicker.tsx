import React, { useMemo } from 'react'

import Filter from 'pages/stats/common/components/Filter'
import { DropdownOption } from 'pages/stats/types'

type Store = { id: number; name: string; type: string }
type Props = {
    stores: Store[]
    onStoreChange: (store: Store) => void
    selectedStore: Store
}

const storeToOption = (store: Store) => ({
    label: store.name,
    value: `${store.id}`,
})

export const StorePicker = ({
    stores,
    onStoreChange,
    selectedStore,
}: Props) => {
    const options = useMemo(() => stores.map(storeToOption), [stores])

    const onOptionChange = (opt: DropdownOption) => {
        const store = stores.find((store) => store.id === parseInt(opt.value))!
        onStoreChange(store)
    }

    return (
        <Filter
            filterName={'Store'}
            filterOptionGroups={[{ options: options }]}
            logicalOperators={[]}
            onChangeOption={onOptionChange}
            onSelectAll={() => {}}
            onRemoveAll={() => {}}
            onChangeLogicalOperator={() => {}}
            selectedOptions={[storeToOption(selectedStore)]}
            isMultiple={false}
            showSearch={false}
            showQuickSelect={false}
            isPersistent
            shouldCloseOnSelect
        />
    )
}
