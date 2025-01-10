import React from 'react'
import type {MouseEvent} from 'react'

import css from './Handle.less'

type Props = {
    onResizeStart: (e: MouseEvent) => void
}

export default function Handle({onResizeStart}: Props) {
    return <div className={css.handle} onMouseDown={onResizeStart} />
}
