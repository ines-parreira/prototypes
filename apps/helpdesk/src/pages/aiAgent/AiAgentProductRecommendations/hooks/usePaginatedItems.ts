import { useCallback, useMemo, useState } from 'react'

interface PaginatedItemsConfig {
    itemsPerPage?: number
}

interface PaginatedItemsResult<T> {
    paginatedItems: T[]
    pagination: {
        hasNextPage: boolean
        hasPrevPage: boolean
        onNextClick: () => void
        onPrevClick: () => void
    }
    page: number
    setPage: (page: number) => void
    search: string
    setSearch: (search: string) => void
    resetPagination: () => void
}

export function usePaginatedItems<T extends { title: string }>(
    items: T[],
    config: PaginatedItemsConfig = {},
): PaginatedItemsResult<T> {
    const { itemsPerPage = 25 } = config
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')

    const filteredItems = useMemo(() => {
        if (search === '') {
            return items
        }
        return items.filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase()),
        )
    }, [items, search])

    const paginatedItems = useMemo(() => {
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = page * itemsPerPage
        return filteredItems.slice(startIndex, endIndex)
    }, [filteredItems, page, itemsPerPage])

    const hasNextPage = useMemo(() => {
        return filteredItems.length > page * itemsPerPage
    }, [filteredItems.length, page, itemsPerPage])

    const hasPrevPage = page > 1

    const onNextClick = useCallback(() => {
        setPage((prev) => prev + 1)
    }, [])

    const onPrevClick = useCallback(() => {
        setPage((prev) => Math.max(1, prev - 1))
    }, [])

    const handleSetSearch = useCallback((newSearch: string) => {
        setSearch(newSearch)
        setPage(1)
    }, [])

    const resetPagination = useCallback(() => {
        setPage(1)
        setSearch('')
    }, [])

    return {
        paginatedItems,
        pagination: {
            hasNextPage,
            hasPrevPage,
            onNextClick,
            onPrevClick,
        },
        page,
        setPage,
        search,
        setSearch: handleSetSearch,
        resetPagination,
    }
}
