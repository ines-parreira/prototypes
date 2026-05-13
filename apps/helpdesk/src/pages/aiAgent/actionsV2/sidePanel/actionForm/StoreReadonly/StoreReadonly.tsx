import { TextField } from '@gorgias/axiom'

import { ProviderIcon } from '../../shared/ProviderIcon'
import type { Store } from '../../types'

type Props = {
    store: Store
    label?: string
}

export const StoreReadonly = ({ store, label = 'Store' }: Props) => {
    return (
        <TextField
            label={label}
            isRequired
            isDisabled
            value={store.name}
            trailingSlot={
                store.iconUrl ? (
                    <ProviderIcon
                        iconUrl={store.iconUrl}
                        alt={store.name}
                        size="sm"
                    />
                ) : undefined
            }
        />
    )
}
