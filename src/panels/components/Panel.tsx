import React, {ReactNode} from 'react'

import css from './Panel.less'

type Props = {
    children: ReactNode
    width?: number
}

export default function Panel({children, width}: Props) {
    return (
        <div className={css.panel} style={{width}}>
            {children}
        </div>
    )
}
