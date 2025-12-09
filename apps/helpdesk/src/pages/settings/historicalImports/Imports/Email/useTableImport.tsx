import { useMemo, useState } from 'react'

import { queryKeys, useListImports } from '@gorgias/helpdesk-queries'
import { ListImportsOrderBy } from '@gorgias/helpdesk-types'

import { OrderDirection } from 'models/api/types'

import type { ImportItem } from '../types'

const PAGE_SIZE = 8
const REFETCH_INTERVAL = 60000 // 1 minute

export const useTableImport = () => {
    const [sortOrder, setSortOrder] = useState<OrderDirection>(
        OrderDirection.Asc,
    )
    const [cursor, setCursor] = useState<string | undefined>()

    const orderBy =
        sortOrder === OrderDirection.Asc
            ? ListImportsOrderBy.StatusDescProviderIdentifierAsc
            : ListImportsOrderBy.StatusAscProviderIdentifierAsc

    const importListingQueryKey = queryKeys.integrations.listImports({
        limit: PAGE_SIZE,
        order_by: orderBy,
        cursor,
    })

    const {
        data: response,
        isLoading,
        isError,
    } = useListImports(
        {
            limit: PAGE_SIZE,
            order_by: orderBy,
            cursor,
        },
        {
            query: {
                staleTime: 0,
                queryKey: importListingQueryKey,
                enabled: true,
                refetchInterval: REFETCH_INTERVAL,
                select: (data) => ({
                    importList: data?.data?.data || [],
                    meta: data?.data?.meta,
                }),
            },
        },
    )

    const handleSortToggle = () => {
        setSortOrder(
            sortOrder === OrderDirection.Asc
                ? OrderDirection.Desc
                : OrderDirection.Asc,
        )
        setCursor(undefined) // Reset cursor when sorting changes
    }

    const importList: ImportItem[] = useMemo(() => {
        if (!response?.importList) {
            return []
        }

        return response?.importList?.sort((a, b) => {
            // it happens that the alphabetical order of statuses is the
            // reverse of the one we want (completed, failed, in_progress).
            // The 2nd order is always ascending email alphabetical.
            const statusComparison = a.status.localeCompare(b.status)
            if (statusComparison !== 0)
                return sortOrder === OrderDirection.Asc
                    ? -statusComparison
                    : statusComparison
            return a.provider_identifier.localeCompare(b.provider_identifier)
        })
    }, [response?.importList, sortOrder])

    const hasNextItems = Boolean(response?.meta?.next_cursor)
    const hasPrevItems = Boolean(response?.meta?.prev_cursor)

    const fetchNextItems = () => {
        setCursor(response?.meta?.next_cursor ?? undefined)
    }

    const fetchPrevItems = () => {
        setCursor(response?.meta?.prev_cursor ?? undefined)
    }

    return {
        tableProps: {
            fetchNextItems,
            fetchPrevItems,
            handleSortToggle,
            hasNextItems,
            hasPrevItems,
            importList,
            sortOrder,
            isLoading,
            isError,
        },
    }
}
