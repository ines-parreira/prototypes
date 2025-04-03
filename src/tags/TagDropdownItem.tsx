import React, { CSSProperties } from 'react'

import { Tag } from '@gorgias/api-queries'

import { Item } from 'components/Dropdown'

import css from './TagDropdownItem.less'

export default function TagDropdownItem({ item }: { item: Item & Tag }) {
    return (
        <div
            className={css.tag}
            {...(!!item.decoration?.color && {
                style: {
                    '--tag-dot-color': item.decoration.color,
                } as CSSProperties,
            })}
        >
            {item.name}
        </div>
    )
}
