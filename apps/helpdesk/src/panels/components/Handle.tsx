import type { MouseEvent } from 'react'
import React from 'react'

import css from './Handle.less'

type Props = {
    onResizeStart: (ev: MouseEvent) => void
}

export function Handle({ onResizeStart }: Props) {
    return <div className={css.handle} onMouseDown={onResizeStart} />
}
