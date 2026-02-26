import React, { useEffect } from 'react'

import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { StoreNameDropdown } from '../../../integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/StoreNameDropdown'
import type { FormState } from '../infobar/Infobar/InfobarCustomerInfo/CustomerSyncForm/useCustomerSyncForm'
import { getDefaultStore } from './helpers'

import css from './ShopifyStoreSelect.less'

interface Props {
    hasError: boolean
    formState: FormState
    onChange: (formState: Partial<FormState>) => void
    shopifyStores: List<Map<string, any>>
}
const ShopifyStoreSelect = ({
    hasError,
    onChange,
    formState,
    shopifyStores,
}: Props) => {
    useEffect(() => {
        if (shopifyStores?.size && !formState.store) {
            onChange({
                store: getDefaultStore(shopifyStores),
            })
        }
    }, [shopifyStores, formState.store, onChange])
    return (
        <div className={css.storeSelect}>
            <Label>Shopify store</Label>
            <div>
                <StoreNameDropdown
                    selectLabel="Select Shopify store"
                    isDisabled={!shopifyStores}
                    hasError={hasError}
                    gorgiasChatIntegrations={fromJS([])}
                    storeIntegrations={shopifyStores || fromJS([])}
                    storeIntegrationId={formState.store}
                    onChange={(storeIntegration) =>
                        onChange({
                            store: storeIntegration,
                        })
                    }
                />
                {hasError && (
                    <div className={css.error}>Please select shopify store</div>
                )}
            </div>
        </div>
    )
}

export default ShopifyStoreSelect
