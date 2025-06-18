import React, { useCallback } from 'react'

import { Magento2Integration } from 'models/integration/types'

import { useMagentoSettings } from './hooks/useMagentoSettings'
import ManualForm from './ManualForm'
import OneClickForm from './OneClickForm'

import css from './MagentoSettings.less'

export type ShopifySettingsProps = {
    integration: Magento2Integration
    onDeleteIntegration: (integration: Magento2Integration) => void
    refetchStore: () => void
    redirectUri: string
}

export default function MagentoSettings({
    integration,
    onDeleteIntegration,
    refetchStore,
    redirectUri,
}: ShopifySettingsProps) {
    const { isManual } = useMagentoSettings(integration)

    const handleDelete = useCallback(() => {
        onDeleteIntegration(integration)
    }, [onDeleteIntegration, integration])

    return (
        <div className={css.container}>
            {isManual ? (
                <ManualForm
                    integration={integration}
                    refetchStore={refetchStore}
                    handleDelete={handleDelete}
                    redirectUri={redirectUri}
                />
            ) : (
                <OneClickForm
                    handleDelete={handleDelete}
                    integration={integration}
                    redirectUri={redirectUri}
                    refetchStore={refetchStore}
                />
            )}
        </div>
    )
}
