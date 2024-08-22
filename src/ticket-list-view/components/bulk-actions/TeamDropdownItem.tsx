import React, {useMemo} from 'react'
import {Emoji} from 'emoji-mart'

import {Item} from 'components/Dropdown'
import {Team} from 'models/team/types'
import Avatar from 'pages/common/components/Avatar/Avatar'

import css from './style.less'

export default function TeamDropdownItem({item}: {item: Item}) {
    const emoji = useMemo(
        () => (item.decoration as Team['decoration'])?.emoji,
        [item.decoration]
    )

    return (
        <div className={css.avatarItem}>
            {emoji ? (
                <Emoji emoji={emoji} size={20} sheetSize={32} forceSize />
            ) : (
                <Avatar name={item.name} shape="round" size={20} />
            )}
            {item.name}
        </div>
    )
}
