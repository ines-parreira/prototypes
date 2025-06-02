import { useMemo } from 'react'

import { useStoresDomainIngestionLogs } from 'pages/aiAgent/hooks/useStoresDomainIngestionLogs'

type Args = {
    storeName: string
}

export const useFetchStoreDomainIngestionLogsData = ({ storeName }: Args) => {
    const { isLoading, data: storesDomainIngestionLogs } =
        useStoresDomainIngestionLogs({
            storeNames: [storeName],
        })

    const data = useMemo(() => {
        if (!storesDomainIngestionLogs) {
            return
        }

        return Object.entries(storesDomainIngestionLogs).find(
            ([entryStoreName]) => entryStoreName === storeName,
        )?.[1]
    }, [storesDomainIngestionLogs, storeName])

    return {
        data,
        isLoading,
    }
}

export type StoreDomainIngestionLogsData = Exclude<
    Awaited<ReturnType<typeof useFetchStoreDomainIngestionLogsData>>['data'],
    null | undefined
>
