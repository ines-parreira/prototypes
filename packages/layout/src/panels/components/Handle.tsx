import cn from 'classnames'
import { useId } from '@gorgias/toolkit-react'

import { useHandle } from '../hooks/useHandle'

import css from './Handle.less'

type Props = {
    className?: string
}

export function Handle({ className }: Props) {
    const id = useId()
    const { onResizeStart } = useHandle(id)

    return (
        <div
            className={cn(css.handle, className, {
                [css.isHidden]: !onResizeStart,
            })}
            data-handle-id={id}
            onMouseDown={onResizeStart}
        />
    )
}
