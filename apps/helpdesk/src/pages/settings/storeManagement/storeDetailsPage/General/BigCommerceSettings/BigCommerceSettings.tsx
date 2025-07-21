import React, { useCallback } from 'react'

import { BigCommerceIntegration } from 'models/integration/types'

import { ActionButtons } from './ActionButtons'
import { InformationForm } from './InformationForm'
import { useBigCommerceSettings } from './useBigCommerceSettings'

import css from './BigCommerceSettings.less'

export type ShopifySettingsProps = {
    integration: BigCommerceIntegration
    onDeleteIntegration: (integration: BigCommerceIntegration) => void
}

export default function BigCommerceSettings({
    integration,
    onDeleteIntegration,
}: ShopifySettingsProps) {
    const {
        shopName,
        isActive,
        needScopeUpdate,
        isSyncComplete,
        retriggerOAuthFlow,
    } = useBigCommerceSettings(integration)

    const handleDelete = useCallback(() => {
        onDeleteIntegration(integration)
    }, [onDeleteIntegration, integration])

    return (
        <form>
            <div className={css.container}>
                <InformationForm
                    isActive={isActive}
                    storeId={integration.id}
                    shopName={shopName}
                    isSyncComplete={isSyncComplete}
                />
                <ActionButtons
                    needScopeUpdate={needScopeUpdate}
                    isActive={isActive}
                    onRetriggerOAuthFlow={retriggerOAuthFlow}
                    onDelete={handleDelete}
                />
            </div>
        </form>
    )
}
