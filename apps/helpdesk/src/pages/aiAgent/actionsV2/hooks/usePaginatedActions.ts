import { useEffect, useMemo, useState } from 'react'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { ACTION_LIBRARY_DEFAULT_PAGE_SIZE } from '../constants'

export const usePaginatedActions = (
    actions: StoreWorkflowsConfiguration[],
    initialPageSize: number = ACTION_LIBRARY_DEFAULT_PAGE_SIZE,
) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialPageSize)

    const totalPages = Math.max(1, Math.ceil(actions.length / pageSize))

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages)
        }
    }, [page, totalPages])

    const pageActions = useMemo(
        () => actions.slice((page - 1) * pageSize, page * pageSize),
        [actions, page, pageSize],
    )

    return {
        page,
        pageSize,
        totalPages,
        pageActions,
        setPage,
        setPageSize: (next: number) => {
            setPageSize(next)
            setPage(1)
        },
    }
}
