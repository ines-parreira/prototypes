import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { PaginationItem } from './components/PaginationItem'
import { usePaginatedItems } from './hooks/usePaginatedItems'
import type { NavigationSize } from './types/NavigationSize'
import type { UiListItem } from './types/UiListItem'

import css from './style.less'

type Props = {
    /**
     * Number of always visible pages at the beginning and end.
     * @default 1
     */
    boundaryCount?: number

    /**
     * The custom CSS class name of the list element.
     */
    className?: string

    /**
     * The custom CSS class name of the item element.
     */
    classNameItem?: string

    /**
     * The total number of pages.
     * @default 1
     */
    count?: number

    /**
     * The page selected by default when the component is uncontrolled.
     * @default 1
     */
    defaultPage?: number

    /**
     * The current page.
     */
    page?: number

    /**
     * Number of always visible pages before and after the current page.
     * @default 1
     */
    siblingCount?: number

    /**
     * The size of the component.
     * @default 'medium'
     */
    size?: NavigationSize

    /**
     * Callback fired when the page is changed.
     */
    onChange?: (page: number) => void

    /**
     * Whether to hide the pagination when there is only one page.
     * @default false
     */
    hideOnSinglePage?: boolean
}

export const NumberedPagination = ({
    boundaryCount = 1,
    className,
    classNameItem,
    count = 1,
    defaultPage = 1,
    page = 1,
    siblingCount = 1,
    size = 'medium',
    onChange,
    hideOnSinglePage = false,
}: Props) => {
    const [currentPage, setCurrentPage] = useState(page ?? defaultPage)

    useEffect(() => {
        if (page !== currentPage) {
            setCurrentPage(page)
        }
    }, [currentPage, page])

    const handlePageChange = useCallback(
        (nextPage: number | null) => {
            if (nextPage === null || nextPage <= 0 || nextPage > count) {
                return
            }

            onChange && onChange(nextPage)
            setCurrentPage(nextPage)
        },
        [count, onChange],
    )

    const rawItems = usePaginatedItems({
        boundaryCount,
        count,
        page: currentPage,
        siblingCount,
    })

    const items = useMemo<UiListItem[]>(() => {
        return rawItems.map((item) => {
            const disabled =
                (item.type === 'previous' && currentPage === 1) ||
                (item.type === 'next' && currentPage === count)

            return {
                ...item,
                className: classNameItem,
                disabled,
                size: size,
                onClick: () => handlePageChange(item.page),
            }
        })
    }, [classNameItem, count, currentPage, handlePageChange, rawItems, size])

    if (hideOnSinglePage && count <= 1) {
        return null
    }

    return (
        <div className={className}>
            <ul className={css.container}>
                {items.map((item) => (
                    <PaginationItem
                        key={`item-${item.type}-${item.page ?? ''}`}
                        className={item.className}
                        disabled={item.disabled}
                        page={item.page}
                        selected={item.selected}
                        size={item.size}
                        type={item.type}
                        onClick={item.onClick}
                    />
                ))}
            </ul>
        </div>
    )
}
