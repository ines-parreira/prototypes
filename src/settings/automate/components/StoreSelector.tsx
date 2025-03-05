import React from 'react'
import type { ChangeEvent } from 'react'

import { StoreIntegration } from 'models/integration/types'

type Props = {
    integrations: StoreIntegration[]
    selected?: number
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
}

export function StoreSelector({ integrations, selected, onChange }: Props) {
    return (
        <select onChange={onChange} value={selected}>
            {integrations.map((integration) => (
                <option key={integration.id} value={integration.id}>
                    {integration.name}
                </option>
            ))}
        </select>
    )
}
