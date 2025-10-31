import { useCallback, useMemo, useState } from 'react'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'
import { User } from '@gorgias/helpdesk-queries'

import { Item } from 'components/Dropdown'
import useAppSelector from 'hooks/useAppSelector'
import Avatar from 'pages/common/components/Avatar/Avatar'
import { getHumanAgentsJS } from 'state/agents/selectors'

import css from './style.less'

export default function UserDropdownItem({ item }: { item: Item }) {
    const users = useAppSelector(getHumanAgentsJS)
    const [isItemOverflowing, setIsItemOverflowing] = useState(false)
    const [itemRef, setItemRef] = useState<HTMLDivElement | null>(null)

    const url = useMemo(
        () =>
            (item.meta as User['meta'])?.profile_picture_url ??
            users.find((user) => user.id === item.id)?.meta
                ?.profile_picture_url,
        [item.id, item.meta, users],
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
                <Avatar name={item.name} url={url} shape="round" size={20} />
                <div className={css.name} ref={itemCallbackRef}>
                    {item.name || item.email}
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
