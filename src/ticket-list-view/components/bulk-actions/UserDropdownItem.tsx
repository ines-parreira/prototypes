import React, {useMemo} from 'react'
import {User} from '@gorgias/api-queries'

import {Item} from 'components/Dropdown'
import Avatar from 'pages/common/components/Avatar/Avatar'

import useAppSelector from 'hooks/useAppSelector'
import {getHumanAgentsJS} from 'state/agents/selectors'

import css from './style.less'

export default function UserDropdownItem({item}: {item: Item}) {
    const users = useAppSelector(getHumanAgentsJS)

    const url = useMemo(
        () =>
            (item.meta as User['meta'])?.profile_picture_url ??
            users.find((user) => user.id === item.id)?.meta
                ?.profile_picture_url,
        [item.id, item.meta, users]
    )

    return (
        <div className={css.item}>
            <Avatar name={item.name} url={url} shape="round" size={20} />
            <div className={css.name}>{item.name}</div>
        </div>
    )
}
