import React, { CSSProperties, useCallback, useState } from 'react'

import { Tag } from '@gorgias/api-queries'
import { Tooltip } from '@gorgias/merchant-ui-kit'

import { Item } from 'components/Dropdown'

import css from './TagDropdownItem.less'

export default function TagDropdownItem({ item }: { item: Item & Tag }) {
    const [isItemOverflowing, setIsItemOverflowing] = useState(false)
    const [itemRef, setItemRef] = useState<HTMLDivElement | null>(null)

    const itemCallbackRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            setItemRef(node)
            setIsItemOverflowing(node.scrollWidth > node.offsetWidth)
        }
    }, [])

    return (
        <>
            <div
                className={css.wrapper}
                {...(!!item.decoration?.color && {
                    style: {
                        '--tag-dot-color': item.decoration.color,
                    } as CSSProperties,
                })}
            >
                <div className={css.dot} />
                <div ref={itemCallbackRef} className={css.name}>
                    {item.name}
                </div>
            </div>
            {isItemOverflowing && !!itemRef && (
                <Tooltip placement="top" target={itemRef}>
                    {item.name}
                </Tooltip>
            )}
        </>
    )
}
