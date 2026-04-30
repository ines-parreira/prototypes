import { useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { useUpsertWorkflowConfiguration } from 'models/workflows/queries'
import type { Paths } from 'rest_api/workflows_api/client.generated'

type StoreConfiguration =
    Paths.StoreWfConfigurationControllerList.Responses.$200[number]
type WfConfiguration = Paths.WfConfigurationControllerGet.Responses.$200

export const useEnableGuidanceAction = (
    shopName: string,
    shopType: string,
    rawActions: StoreConfiguration[],
) => {
    const queryClient = useQueryClient()
    const [enablingIds, setEnablingIds] = useState(new Set<string>())

    const { mutateAsync: upsertConfig } = useUpsertWorkflowConfiguration()

    const enableAction = async (actionId: string) => {
        const raw = rawActions.find((a) => a.id === actionId)
        if (!raw) return

        const config = queryClient.getQueryData<WfConfiguration>([
            'guidance-action-config',
            actionId,
        ])
        if (!config) return

        const configAny = config as WfConfiguration & {
            entrypoints?: Array<Record<string, unknown>>
        }
        const updatedConfig = {
            ...config,
            entrypoints: configAny.entrypoints?.map((ep) =>
                ep.trigger === 'llm-prompt'
                    ? { ...ep, deactivated_datetime: null }
                    : ep,
            ),
        }

        setEnablingIds((prev) => new Set([...prev, actionId]))
        try {
            await upsertConfig([
                raw.internal_id,
                updatedConfig as Paths.WfConfigurationControllerUpsert.RequestBody,
            ])
            void queryClient.invalidateQueries({
                queryKey: ['guidance-actions-all', shopName, shopType],
            })
            void queryClient.invalidateQueries({
                queryKey: ['guidance-actions-enabled', shopName, shopType],
            })
            void queryClient.invalidateQueries({
                queryKey: ['guidance-action-config', actionId],
            })
        } finally {
            setEnablingIds((prev) => {
                const next = new Set(prev)
                next.delete(actionId)
                return next
            })
        }
    }

    return { enableAction, enablingIds }
}
