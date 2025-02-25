import React, { MouseEvent } from 'react'

import css from './Handle.less'

type Props = {
    onResizeStart: (ev: MouseEvent) => void
}

export default function Handle({ onResizeStart }: Props) {
    return <div className={css.handle} onMouseDown={onResizeStart} />
}
