import { useMemo } from 'react'

import { PageType } from '../types/PageType'
import { RawListItem } from '../types/RawListItem'

/**
 * @description
 *    Create an array of numbers based on the start and end values
 */
const _range = (start: number, end: number): number[] => {
    const length = end - start + 1
    return Array.from({ length }, (_, i) => start + i)
}

/**
 * @description
 *    Calculate the next page number based on the type of button clicked
 */
const _calculateButtonPage = (type: string, page: number): number | null => {
    switch (type) {
        case 'previous':
            return page - 1
        case 'next':
            return page + 1
        default:
            return null
    }
}

type HookProps = {
    boundaryCount: number
    count: number
    page: number
    siblingCount: number
}

export function usePaginatedItems({
    boundaryCount,
    count,
    page,
    siblingCount,
}: HookProps): RawListItem[] {
    const startPages = useMemo(
        () => _range(1, Math.min(boundaryCount, count)),
        [boundaryCount, count],
    )
    const endPages = useMemo(
        () =>
            _range(
                Math.max(count - boundaryCount + 1, boundaryCount + 1),
                count,
            ),
        [boundaryCount, count],
    )

    const siblingsStart = Math.max(
        Math.min(
            // Natural start
            page - siblingCount,
            // Lower boundary when page is high
            count - boundaryCount - siblingCount * 2 - 1,
        ),
        // Greater than startPages
        boundaryCount + 2,
    )

    const siblingsEnd = Math.min(
        Math.max(
            // Natural end
            page + siblingCount,
            // Upper boundary when page is low
            boundaryCount + siblingCount * 2 + 2,
        ),
        // Less than endPages
        endPages.length > 0 ? endPages[0] - 2 : count - 1,
    )

    const itemList = useMemo(() => {
        return [
            'previous',
            ...startPages,

            // Start ellipsis
            ...(siblingsStart > boundaryCount + 2
                ? ['start-ellipsis']
                : boundaryCount + 1 < count - boundaryCount
                  ? [boundaryCount + 1]
                  : []),

            // Sibling pages
            ..._range(siblingsStart, siblingsEnd),

            // End ellipsis
            ...(siblingsEnd < count - boundaryCount - 1
                ? ['end-ellipsis']
                : count - boundaryCount > boundaryCount
                  ? [count - boundaryCount]
                  : []),

            ...endPages,
            'next',
        ]
    }, [boundaryCount, count, endPages, siblingsEnd, siblingsStart, startPages])

    const items = useMemo<RawListItem[]>(
        () =>
            itemList.map((item) => {
                if (typeof item === 'number') {
                    return {
                        page: item,
                        selected: item === page,
                        type: 'page' as PageType,
                    }
                }

                return {
                    page: _calculateButtonPage(item, page),
                    selected: false,
                    type: item as PageType,
                }
            }),
        [itemList, page],
    )

    return items
}
