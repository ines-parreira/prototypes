import {useState} from 'react'

export default function useClientSidePagination<T>({
    items,
    itemsPerPage,
}: {
    items: T[]
    itemsPerPage: number
}) {
    const [page, setPage] = useState(1)

    const pageCount = Math.ceil(items.length / itemsPerPage)
    const paginatedItems = items.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    )

    return {
        currentPage: page,
        pageCount,
        onChange: setPage,
        paginatedItems,
    }
}
