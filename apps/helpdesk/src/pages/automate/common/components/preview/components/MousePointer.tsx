import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import mousePointer from 'assets/img/self-service/mouse-pointer.png'

import css from './MousePointer.less'

type Props = {
    isHovering?: boolean
    isAlignedToRight?: boolean
    children: ReactNode
}

const MousePointer = ({ isHovering, isAlignedToRight, children }: Props) => {
    return (
        <div className={css.container}>
            {children}
            {isHovering && (
                <img
                    className={classnames(css.pointer, {
                        [css.isAlignedToRight]: isAlignedToRight,
                    })}
                    src={mousePointer}
                    alt=""
                />
            )}
        </div>
    )
}

export default MousePointer
