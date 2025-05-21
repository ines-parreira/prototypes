import { useMemo } from 'react'

import { usePublicResourcesList } from 'pages/aiAgent/hooks/usePublicResourcesList'

type Args = {
    storeName: string
}

export const useFetchPublicResourcesData = ({ storeName }: Args) => {
    const { isLoading, sourceItems } = usePublicResourcesList({
        shopNames: [storeName],
    })

    const data = useMemo(() => {
        if (!sourceItems) {
            return
        }

        return Object.entries(sourceItems).find(
            ([itemStoreName]) => itemStoreName === storeName,
        )?.[1]
    }, [sourceItems, storeName])

    return {
        data,
        isLoading,
    }
}

export type PublicResourcesData = Exclude<
    Awaited<ReturnType<typeof useFetchPublicResourcesData>>['data'],
    null | undefined
>
