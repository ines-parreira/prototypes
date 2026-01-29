import { useContext, useMemo } from 'react'

import { useListMetafieldDefinitions } from '@gorgias/helpdesk-queries'

import { IntegrationContext } from 'providers/infobar/IntegrationContext'

export function useMetafieldsFilter() {
    const { integrationId } = useContext(IntegrationContext)

    const { data } = useListMetafieldDefinitions(
        integrationId!,
        { pinned: true, visible: true },
        {
            query: {
                enabled: integrationId !== null,
                staleTime: 60000,
                cacheTime: 60000,
            },
        },
    )

    const definitions = useMemo(() => data?.data?.data ?? [], [data])

    const filterMetafields = useMemo(() => {
        return <T extends { namespace?: string; key?: string }>(
            metafields: T[],
        ): (T & { name?: string })[] => {
            const result: (T & { name?: string })[] = []
            for (const mf of metafields) {
                const def = definitions.find(
                    (d) => d.namespace === mf.namespace && d.key === mf.key,
                )
                if (def) {
                    result.push({ ...mf, name: def.name })
                }
            }
            return result
        }
    }, [definitions])

    return { filterMetafields }
}
