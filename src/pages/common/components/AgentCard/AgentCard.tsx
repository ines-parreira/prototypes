import React from 'react'
import Avatar from 'pages/common/components/Avatar/Avatar'

import css from './AgentCard.less'

type Props = {
    name: string
    url?: string | null
    badgeColor?: string
    description?: string
}

export default function AgentCard({name, url, badgeColor, description}: Props) {
    return (
        <div className={css.container}>
            <Avatar
                shape="round"
                name={name}
                url={url}
                size={36}
                badgeColor={badgeColor}
            />
            <div className={css.info}>
                <div className={css.name}>{name}</div>
                <div className={css.description}>{description}</div>
            </div>
        </div>
    )
}
