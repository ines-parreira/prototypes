import { useCallback } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    useCreateStoreMapping,
    useUpdateStoreMapping,
} from 'models/storeMapping/queries'

import { Components } from '../../../../../../rest_api/help_center_api/client.generated'

import HelpCenterDto = Components.Schemas.HelpCenterDto

export const useStoreToChannelMappings = () => {
    const isMultiStoreEnabled = useFlag(FeatureFlagKey.MultiStore, false)
    const { mutateAsync: createMapping } = useCreateStoreMapping()
    const { mutateAsync: updateMapping } = useUpdateStoreMapping()

    const createConnection = useCallback(
        async (storeId: number, helpCenterIntegrationId: number) => {
            await createMapping([
                {
                    store_id: storeId,
                    integration_id: helpCenterIntegrationId,
                },
            ])
        },
        [createMapping],
    )

    const updateConnection = useCallback(
        async (storeId: number, helpCenterIntegrationId: number) => {
            const mappingData = {
                store_id: storeId,
                integration_id: helpCenterIntegrationId,
            }

            await updateMapping([mappingData, helpCenterIntegrationId])
        },
        [updateMapping],
    )

    const handleStoreToChannelMapping = useCallback(
        async (isUpdate: boolean, helpCenter?: HelpCenterDto | null) => {
            const {
                shop_integration_id: storeId,
                integration_id: helpCenterIntegrationId,
            } = helpCenter || {}

            if (!storeId || !helpCenterIntegrationId) {
                return
            }

            if (isMultiStoreEnabled) {
                if (isUpdate) {
                    await updateConnection(storeId, helpCenterIntegrationId)
                } else {
                    await createConnection(storeId, helpCenterIntegrationId)
                }
            }
        },
        [isMultiStoreEnabled, createConnection, updateConnection],
    )

    return {
        handleStoreToChannelMapping,
    }
}
