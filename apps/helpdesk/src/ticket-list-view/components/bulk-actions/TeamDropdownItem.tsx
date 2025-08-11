import { useCallback, useMemo, useState } from 'react'

import { Emoji } from 'emoji-mart'

import { Tooltip } from '@gorgias/axiom'

import { Item } from 'components/Dropdown'
import { Team } from 'models/team/types'
import Avatar from 'pages/common/components/Avatar/Avatar'

import css from './style.less'

export default function TeamDropdownItem({ item }: { item: Item }) {
    const [isItemOverflowing, setIsItemOverflowing] = useState(false)
    const [itemRef, setItemRef] = useState<HTMLDivElement | null>(null)

    const emoji = useMemo(
        () => (item.decoration as Team['decoration'])?.emoji,
        [item.decoration],
    )

    const itemCallbackRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            setItemRef(node)
            setIsItemOverflowing(node.scrollWidth > node.offsetWidth)
        }
    }, [])

    return (
        <>
            <div className={css.item}>
                {emoji ? (
                    <Emoji emoji={emoji} size={20} sheetSize={32} forceSize />
                ) : (
                    <Avatar name={item.name} shape="round" size={20} />
                )}
                <div className={css.name} ref={itemCallbackRef}>
                    {item.name}
                </div>
            </div>
            {isItemOverflowing && !!itemRef && (
                <Tooltip placement="top" target={itemRef}>
                    {item.name || item.email}
                </Tooltip>
            )}
        </>
    )
}
