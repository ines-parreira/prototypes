import React, { useMemo } from 'react'

import { IntegrationType } from 'models/integration/constants'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'
import { getIconFromType } from 'state/integrations/helpers'

import css from './StorePicker.less'

type Store = { id: number; name: string; type: IntegrationType }
type Props = {
    stores: Store[]
    onStoreChange: (store: Store) => void
    selectedStore: Store
}

const storeToOption = (store: Store) => ({
    value: store.id,
    text: store.name,
    label: (
        <div className={css.filterLabel}>
            <img
                src={getIconFromType(store.type)}
                className={css.shopLabelIcon}
                alt="logo"
            />
            {store.name}
        </div>
    ),
})

export const StorePicker = ({
    stores,
    onStoreChange,
    selectedStore,
}: Props) => {
    const options = useMemo(() => stores.map(storeToOption), [stores])

    const onOptionChange = (value: Value) => {
        const store = stores.find((store) => store.id === value)!
        onStoreChange(store)
    }

    return (
        <div className={css.dropdownWrapper}>
            <SelectField
                value={selectedStore.id}
                onChange={onOptionChange}
                options={options}
                dropdownMenuClassName={css.filterDropdownMenu}
                showSelectedOption
            />
        </div>
    )
}
