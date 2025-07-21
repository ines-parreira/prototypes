import { useMemo } from 'react'

import { useStoresKnowledgeStatus } from 'pages/aiAgent/hooks/useStoresKnowledgeStatus'

type Args = {
    storeName: string
    enabled?: boolean
}

export const useFetchStoreKnowledgeStatusData = ({
    storeName,
    enabled = true,
}: Args) => {
    const { isLoading, data: storesKnowledgeStatus } = useStoresKnowledgeStatus(
        { enabled },
    )

    const data = useMemo(() => {
        if (!storesKnowledgeStatus) {
            return undefined
        }

        return Object.entries(storesKnowledgeStatus).find(
            ([entryStoreName]) => entryStoreName === storeName,
        )?.[1]
    }, [storesKnowledgeStatus, storeName])

    return {
        data,
        isLoading,
    }
}

export type StoreKnowledgeStatusData = Exclude<
    Awaited<ReturnType<typeof useFetchStoreKnowledgeStatusData>>['data'],
    null | undefined
>
