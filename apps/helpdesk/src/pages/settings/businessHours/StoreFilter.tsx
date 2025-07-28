import { useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { StoreIntegration } from 'models/integration/types'
import StoreSelector from 'pages/common/components/StoreSelector/StoreSelector'
import { getStoreIntegrations } from 'state/integrations/selectors'

type Props = {
    onChange: (storeId: number | null) => void
}

export default function StoreFilter({ onChange }: Props) {
    const integrations = useAppSelector(getStoreIntegrations)
    const [selectedIntegration, setSelectedIntegration] =
        useState<StoreIntegration | null>(null)

    return (
        <StoreSelector
            integrations={integrations}
            selected={selectedIntegration}
            onChange={(integrationId) => {
                const integration =
                    integrationId !== null
                        ? integrations.find(
                              (integration) =>
                                  integration.id === Number(integrationId),
                          ) || null
                        : null
                setSelectedIntegration(integration)
                onChange(integration?.id ?? null)
            }}
            withSearch
            withAllOption
        />
    )
}
