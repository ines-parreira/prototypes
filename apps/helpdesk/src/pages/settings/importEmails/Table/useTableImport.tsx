import { useMemo, useState } from 'react'

import { useListImports } from '@gorgias/helpdesk-queries'
import { ImportStatus as ApiImportStatus } from '@gorgias/helpdesk-types'

import { OrderDirection } from 'models/api/types'

import { ImportItem, ImportStatus } from '../types'

const PAGE_SIZE = 8
const START_PAGE = 1

const mapApiStatusToImportStatus = (
    apiStatus: ApiImportStatus,
): ImportStatus => {
    switch (apiStatus) {
        case ApiImportStatus.Completed:
            return 'completed'
        case ApiImportStatus.Failed:
            return 'failed'
        case ApiImportStatus.InProgress:
            return 'in_progress'
        default:
            return 'in_progress'
    }
}

export const useTableImport = () => {
    const [sortOrder, setSortOrder] = useState<OrderDirection>(
        OrderDirection.Asc,
    )
    const [page, setPage] = useState<number>(START_PAGE)

    const { data: response, isLoading, isError } = useListImports()

    const handleSortToggle = () => {
        setSortOrder(
            sortOrder === OrderDirection.Asc
                ? OrderDirection.Desc
                : OrderDirection.Asc,
        )
    }

    const importList: ImportItem[] = useMemo(() => {
        if (!response?.data?.data) {
            return []
        }

        const mappedItems: ImportItem[] = response.data.data.map(
            (apiImport) => ({
                id: apiImport.id.toString(),
                email: apiImport.provider_identifier,
                emailCount: apiImport.stats?.total_tickets_created || 0,
                import_window_start: apiImport.import_window_start,
                import_window_end: apiImport.import_window_end,
                status: mapApiStatusToImportStatus(apiImport.status),
                progressPercentage: apiImport.progress_percentage,
                provider: apiImport.provider,
            }),
        )

        return mappedItems
            .sort((a, b) => {
                // it happens that the alphabetical order of statuses is the
                // reverse of the one we want (completed, failed, in_progress).
                // The 2nd order is always ascending email alphabetical.
                const statusComparison = a.status.localeCompare(b.status)
                if (statusComparison !== 0)
                    return sortOrder === OrderDirection.Asc
                        ? -statusComparison
                        : statusComparison
                return a.email.localeCompare(b.email)
            })
            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    }, [response, page, sortOrder])

    const totalItems = response?.data?.data?.length || 0
    const hasNextItems = totalItems > page * PAGE_SIZE
    const hasPrevItems = page > 1
    const fetchNextItems = () => {
        setPage(page + 1)
    }

    const fetchPrevItems = () => {
        setPage(page - 1)
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
