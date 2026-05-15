import { useCallback } from 'react'

import { useUpsertStoreWorkflowsConfiguration } from 'models/workflows/queries'
import type { Paths } from 'rest_api/workflows_api/client.generated'

type StoreConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$200[number]
type StoreType = Paths.StoreWfConfigurationControllerUpsert.Parameters.StoreType

export type EnableActionArgs = {
    storeName: string
    storeType: StoreType
    configuration: StoreConfiguration
}

export const useEnableAction = () => {
    const { mutateAsync } = useUpsertStoreWorkflowsConfiguration()

    return useCallback(
        ({ storeName, storeType, configuration }: EnableActionArgs) =>
            mutateAsync([
                {
                    store_type: storeType,
                    store_name: storeName,
                    internal_id: configuration.internal_id,
                },
                {
                    ...configuration,
                    entrypoints: configuration.entrypoints.map((entrypoint) =>
                        entrypoint.kind === 'llm-conversation'
                            ? { ...entrypoint, deactivated_datetime: null }
                            : entrypoint,
                    ),
                } as Paths.StoreWfConfigurationControllerUpsert.RequestBody,
            ]),
        [mutateAsync],
    )
}
