import { useMemo } from 'react'

import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'

export const useActionAppIds = ({
    shopName,
    shopType,
}: {
    shopName: string
    shopType: string
}): Set<string> => {
    const { data: configurations = [] } = useGetStoreWorkflowsConfigurations({
        storeName: shopName,
        storeType: shopType,
        triggers: ['llm-prompt'],
    })

    return useMemo(() => {
        const ids = new Set<string>()
        for (const configuration of configurations) {
            for (const app of configuration.apps ?? []) {
                if (app.type === 'app') {
                    ids.add(app.app_id)
                } else {
                    ids.add(app.type)
                }
            }
        }
        return ids
    }, [configurations])
}
