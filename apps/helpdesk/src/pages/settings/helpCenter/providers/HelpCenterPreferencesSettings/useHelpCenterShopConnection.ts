import { useCallback } from 'react'

import type { HelpCenter } from 'models/helpCenter/types'
import {
    useCreateStoreMapping,
    useDeleteStoreMapping,
    useListStoreMappings,
    useUpdateStoreMapping,
} from 'models/storeMapping/queries'

import { useHelpCenterApi } from '../../hooks/useHelpCenterApi'
import {
    integrationIsAlreadyMapped,
    isConnectionGettingCreated,
    isConnectionGettingDeleted,
    isConnectionGettingUpdated,
} from './HelpCenterPreferencesSettings.helpers'

export type ConnectedShop = {
    shopName: string | null
    shopIntegrationId: number | null
    selfServiceDeactivated: boolean
}

export const useHelpCenterShopConnection = (helpCenter: HelpCenter) => {
    const { client } = useHelpCenterApi()
    const { mutateAsync: createMapping } = useCreateStoreMapping()
    const { mutateAsync: updateMapping } = useUpdateStoreMapping()
    const { mutateAsync: deleteMapping } = useDeleteStoreMapping()

    const { data: storeMappings, refetch } = useListStoreMappings(
        [helpCenter.integration_id!],
        {
            enabled: !!helpCenter.integration_id,
            staleTime: Infinity,
            refetchOnMount: 'always',
        },
    )

    const updateHelpCenterDirect = useCallback(
        async (connectedShop: ConnectedShop) => {
            if (!client) return null

            const { data: updatedHelpCenter } = await client.updateHelpCenter(
                { help_center_id: helpCenter.id },
                {
                    shop_name: connectedShop.shopName,
                    shop_integration_id: connectedShop.shopIntegrationId,
                    self_service_deactivated:
                        connectedShop.selfServiceDeactivated,
                },
            )
            return updatedHelpCenter
        },
        [client, helpCenter.id],
    )

    const handleMultiStoreConnection = useCallback(
        async (connectedShop: ConnectedShop) => {
            if (!helpCenter.integration_id) return null

            const currentShopId = helpCenter.shop_integration_id
            const newShopId = connectedShop.shopIntegrationId
            const isAlreadyMapped = integrationIsAlreadyMapped(
                helpCenter.integration_id,
                storeMappings || [],
            )

            const mappingData = {
                store_id: newShopId!,
                integration_id: helpCenter.integration_id,
            }

            if (isConnectionGettingCreated(currentShopId, newShopId)) {
                await createMapping([mappingData])
                await refetch()
            } else if (isConnectionGettingUpdated(currentShopId, newShopId)) {
                if (isAlreadyMapped) {
                    await updateMapping([
                        mappingData,
                        helpCenter.integration_id,
                    ])
                } else {
                    await createMapping([mappingData])
                    await refetch()
                }
            } else if (isConnectionGettingDeleted(currentShopId, newShopId)) {
                if (isAlreadyMapped) {
                    await deleteMapping([helpCenter.integration_id])
                    await refetch()
                } else {
                    return await updateHelpCenterDirect(connectedShop)
                }
            }

            if (!client) return null
            const { data: updatedHelpCenter } = await client.getHelpCenter({
                help_center_id: helpCenter.id,
            })
            return updatedHelpCenter
        },
        [
            helpCenter.integration_id,
            helpCenter.shop_integration_id,
            helpCenter.id,
            storeMappings,
            createMapping,
            updateMapping,
            deleteMapping,
            client,
            updateHelpCenterDirect,
            refetch,
        ],
    )

    const handleShopConnectionChange = useCallback(
        async (connectedShop: ConnectedShop) => {
            if (!client) return null

            if (helpCenter.integration_id) {
                return await handleMultiStoreConnection(connectedShop)
            }

            return await updateHelpCenterDirect(connectedShop)
        },
        [
            client,
            helpCenter.integration_id,
            handleMultiStoreConnection,
            updateHelpCenterDirect,
        ],
    )

    return {
        storeMappings,
        handleShopConnectionChange,
    }
}
