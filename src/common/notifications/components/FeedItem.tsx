import React, {ReactNode} from 'react'

import css from './FeedItem.less'

export type Props = {
    children: ReactNode
}

export default function FeedItem({children}: Props) {
    return <div className={css.container}>{children}</div>
}
