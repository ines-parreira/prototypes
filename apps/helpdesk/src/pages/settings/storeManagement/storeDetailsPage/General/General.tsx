import React, { useCallback, useState } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {
    isBigCommerceIntegration,
    isMagento2Integration,
    isShopifyIntegration,
    StoreIntegration,
} from 'models/integration/types'
import { makeGetRedirectUri } from 'state/integrations/selectors'

import BigCommerceSettings from './BigCommerceSettings/BigCommerceSettings'
import getStoreTypeName from './helpers/getStoreTypeName'
import useStoreDeleter from './hooks/useStoreDeleter'
import MagentoSettings from './MagentoSettings/MagentoSettings'
import DeleteIntegrationConfirmationModal from './ShopifySettings/DeleteIntegrationConfirmationModal'
import ShopifySettings from './ShopifySettings/ShopifySettings'

interface GeneralProps {
    store: StoreIntegration
    refetchStore: () => void
}

export default function General({ store, refetchStore }: GeneralProps) {
    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const [integrationToDelete, setIntegrationToDelete] =
        useState<StoreIntegration | null>(null)
    const { deleteIntegration, isDeleting } = useStoreDeleter()

    const redirectUri = getRedirectUri(store.type)

    const onDeleteConfirm = useCallback(() => {
        if (integrationToDelete) {
            deleteIntegration({ id: integrationToDelete.id })
            setIntegrationToDelete(null)
        }
    }, [deleteIntegration, integrationToDelete])

    return (
        <>
            {store && isShopifyIntegration(store) ? (
                <ShopifySettings
                    refetchStore={refetchStore}
                    integration={store}
                    onDeleteIntegration={setIntegrationToDelete}
                    redirectUri={redirectUri}
                />
            ) : null}

            {store && isBigCommerceIntegration(store) ? (
                <BigCommerceSettings
                    integration={store}
                    onDeleteIntegration={setIntegrationToDelete}
                />
            ) : null}

            {store && isMagento2Integration(store) ? (
                <MagentoSettings
                    refetchStore={refetchStore}
                    redirectUri={redirectUri}
                    integration={store}
                    onDeleteIntegration={setIntegrationToDelete}
                />
            ) : null}

            <DeleteIntegrationConfirmationModal
                isOpen={!!integrationToDelete}
                setIsOpen={() => setIntegrationToDelete(null)}
                onConfirm={onDeleteConfirm}
                storeType={getStoreTypeName(integrationToDelete)}
                isLoading={isDeleting}
            />
        </>
    )
}
