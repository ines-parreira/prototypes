import classnames from 'classnames'
import React, {ReactNode, useCallback, MouseEvent} from 'react'

import {Handle, Position} from 'reactflow'

import css from './VisualBuilderNode.less'

type Props = {
    isClickable: boolean
    isSelected?: boolean
    isErrored?: boolean
    isGreyedOut?: boolean | null
    height?: number
    source?: boolean
    target?: boolean
    children: ReactNode
}

const VisualBuilderNode = ({
    isClickable,
    isSelected,
    isErrored,
    isGreyedOut,
    height = 96,
    source = true,
    target = true,
    children,
}: Props) => {
    const handleClick = useCallback(
        (event: MouseEvent<HTMLDivElement>) => {
            if (!isClickable) {
                event.stopPropagation()
            }
        },
        [isClickable]
    )

    return (
        <div
            className={classnames(css.container, {
                [css.isClickable]: isClickable,
                [css.isSelected]: isSelected,
                [css.isErrored]: isErrored,
                [css.isGreyedOut]: isGreyedOut,
            })}
            style={{height}}
            onClick={handleClick}
        >
            {source && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.source}
                />
            )}
            {children}
            {target && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className={css.target}
                />
            )}
        </div>
    )
}

export default VisualBuilderNode
