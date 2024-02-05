import React, {useState, ReactNode, useMemo} from 'react'
import cs from 'classnames'

import {compare} from 'utils'
import css from './List.less'

export const DEFAULT_INITIAL_ITEM_DISPLAYED_NUMBER = 3

type Props = {
    isDraggable: boolean
    dataKey: string
    listItems: Record<string, unknown>[]
    initialItemDisplayedNumber?: number
    orderBy?: {
        key: string
        direction: 'ASC' | 'DESC'
    }
    isEditing: boolean
    children: (listItems: Props['listItems']) => ReactNode
}

function List({
    isDraggable,
    dataKey,
    listItems,
    initialItemDisplayedNumber,
    orderBy,
    isEditing,
    children,
}: Props) {
    const [showMoreTimes, setShowMoreTimes] = useState(0)

    const sortedItems = useMemo(() => {
        const sortedItems = [...listItems]
        if (orderBy) {
            sortedItems.sort((a, b) => {
                return orderBy.direction === 'ASC'
                    ? compare(a[orderBy.key], b[orderBy.key])
                    : compare(b[orderBy.key], a[orderBy.key])
            })
        }
        return sortedItems
    }, [listItems, orderBy])

    if (!listItems.length) {
        return null
    }

    let itemDisplayedLimit = initialItemDisplayedNumber
        ? initialItemDisplayedNumber
        : DEFAULT_INITIAL_ITEM_DISPLAYED_NUMBER

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

    const trimmedItems = sortedItems.slice(0, itemDisplayedLimit)

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
