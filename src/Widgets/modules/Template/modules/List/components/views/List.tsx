import cs from 'classnames'
import React, {useState, ReactNode, useMemo} from 'react'

import {compare} from 'utils'
import {isRecord} from 'utils/types'
import {DEFAULT_LIST_ITEM_DISPLAYED_NUMBER} from 'Widgets/modules/Template/config/template'

import css from './List.less'

type Props<I extends unknown[]> = {
    isDraggable: boolean
    dataKey: string
    listItems: I
    initialItemDisplayedNumber?: number
    orderBy?: {
        key: string
        direction: 'ASC' | 'DESC'
    }
    isEditing: boolean
    children: (listItems: I) => ReactNode
}

function List<I extends unknown[]>({
    isDraggable,
    dataKey,
    listItems,
    initialItemDisplayedNumber,
    orderBy,
    isEditing,
    children,
}: Props<I>) {
    const [showMoreTimes, setShowMoreTimes] = useState(0)

    const sortedItems = useMemo(() => {
        const sortedItems = [...listItems]
        if (orderBy) {
            sortedItems.sort((a, b) => {
                if (isRecord(a) && isRecord(b)) {
                    return orderBy.direction === 'ASC'
                        ? compare(a[orderBy.key], b[orderBy.key])
                        : compare(b[orderBy.key], a[orderBy.key])
                }
                return 0
            })
        }
        return sortedItems
    }, [listItems, orderBy])

    if (!listItems.length) {
        return null
    }

    let itemDisplayedLimit = initialItemDisplayedNumber
        ? initialItemDisplayedNumber
        : DEFAULT_LIST_ITEM_DISPLAYED_NUMBER

    if (isEditing) {
        itemDisplayedLimit = 1
    } else {
        itemDisplayedLimit = itemDisplayedLimit * (showMoreTimes + 1)
    }

    const excludedItems = listItems.length - itemDisplayedLimit

    let remainingListItemsMessage = null
    if (excludedItems > 0) {
        remainingListItemsMessage = isEditing ? (
            <div className={css.hiddenItems}>{`${excludedItems} more`}</div>
        ) : (
            <div>
                <button
                    className={css.showMore}
                    type="button"
                    onClick={() => setShowMoreTimes(showMoreTimes + 1)}
                >
                    <i className="material-icons">unfold_more</i>
                    {excludedItems}&nbsp;more
                </button>
            </div>
        )
    }

    const trimmedItems = sortedItems.slice(0, itemDisplayedLimit) as I

    return (
        <div
            className={cs({
                draggable: isDraggable,
            })}
            data-key={dataKey}
        >
            {children(trimmedItems)}
            {remainingListItemsMessage && (
                <div>{remainingListItemsMessage}</div>
            )}
        </div>
    )
}

export default List
