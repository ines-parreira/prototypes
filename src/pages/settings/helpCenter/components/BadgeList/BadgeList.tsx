import React from 'react'

import {BadgeItem, BadgeItemProps} from './BadgeItem'

import css from './BadgeList.less'

type BadgeListProps = {
    list: BadgeItemProps[]
    suffix?: React.ReactNode | React.ReactNode[]
    onRemoveItem: (ev: React.MouseEvent, badge: BadgeItemProps) => void
}

export const BadgeList = ({list, suffix, onRemoveItem}: BadgeListProps) => {
    return (
        <div className={css.wrapper}>
            {list.map((badge) => (
                <BadgeItem
                    key={badge.id}
                    id={badge.id}
                    help={badge?.help}
                    isClosable={badge?.isClosable}
                    label={badge.label}
                    onClose={(ev: React.MouseEvent) => onRemoveItem(ev, badge)}
                />
            ))}
            {suffix}
        </div>
    )
}
