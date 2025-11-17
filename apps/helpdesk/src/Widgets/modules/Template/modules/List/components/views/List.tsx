import type { ReactNode } from 'react'
import React, { useMemo, useState } from 'react'

import cs from 'classnames'

import { DEFAULT_LIST_ITEM_DISPLAYED_NUMBER } from 'Widgets/modules/Template/config/template'

import type { OrderBy } from '../../utils/sortListItems'
import { sortListItems } from '../../utils/sortListItems'

import css from './List.less'

type Props<I extends unknown[]> = {
    isDraggable: boolean
    dataKey: string
    listItems: I
    initialItemDisplayedNumber?: number
    orderBy?: OrderBy
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
        return sortListItems(listItems, orderBy)
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
