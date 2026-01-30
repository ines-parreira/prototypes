import { useMemo } from 'react'

import { ListItem, SelectField } from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

type Props = {
    integrations: Integration[]
    selectedIntegrationId?: number
    onChange: (integration: Integration) => void
    isLoading?: boolean
    isDisabled?: boolean
    placeholder?: string
}

export function StorePicker({
    integrations,
    selectedIntegrationId,
    onChange,
    isLoading = false,
}: Props) {
    const selectedIntegration = useMemo(
        () =>
            integrations.find(
                (integration) => integration.id === selectedIntegrationId,
            ),
        [integrations, selectedIntegrationId],
    )

    return (
        <SelectField<Integration>
            items={integrations}
            value={selectedIntegration}
            onChange={(store) => onChange(store)}
            aria-label="Select a store"
            isDisabled={isLoading}
            isSearchable
            leadingSlot={
                selectedIntegrationId ? 'vendor-shopify-colored' : undefined
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
        </SelectField>
    )
}
