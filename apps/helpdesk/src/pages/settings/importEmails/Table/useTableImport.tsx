import { useMemo, useState } from 'react'

import { OrderDirection } from 'models/api/types'

import { mockImportItems } from '../fixture'
import { ImportItem } from '../types'

const PAGE_SIZE = 8
const START_PAGE = 1

export const useTableImport = () => {
    const [sortOrder, setSortOrder] = useState<OrderDirection>(
        OrderDirection.Asc,
    )
    const [page, setPage] = useState<number>(START_PAGE)

    const handleSortToggle = () => {
        setSortOrder(
            sortOrder === OrderDirection.Asc
                ? OrderDirection.Desc
                : OrderDirection.Asc,
        )
    }

    const importList: ImportItem[] = useMemo(() => {
        return mockImportItems
            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
            .sort((a, b) => {
                if (sortOrder === OrderDirection.Asc) {
                    return a.email.localeCompare(b.email)
                }
                return b.email.localeCompare(a.email)
            })
    }, [page, sortOrder])

    const hasNextItems = mockImportItems.length > page * PAGE_SIZE
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
            isLoading: false,
        },
    }
}
