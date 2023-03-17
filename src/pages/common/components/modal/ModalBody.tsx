import React, {forwardRef, ReactNode, Ref, useContext} from 'react'
import classnames from 'classnames'

import {ModalContext} from './Modal'

import css from './ModalBody.less'

type Props = {
    children: ReactNode
    className?: string
}

const ModalBody = (
    {children, className}: Props,
    forwardedRef: Ref<HTMLDivElement> | null | undefined
) => {
    const {isScrollable, bodyId} = useContext(ModalContext)

    return (
        <div
            className={classnames(
                css.wrapper,
                {[css.scrollable]: isScrollable},
                className
            )}
            id={bodyId}
            ref={forwardedRef}
        >
            {children}
        </div>
    )
}

export default forwardRef(ModalBody)
