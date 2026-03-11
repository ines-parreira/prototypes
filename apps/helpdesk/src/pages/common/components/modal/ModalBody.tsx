import type { ForwardedRef, ReactNode } from 'react'
import React, { forwardRef, useContext } from 'react'

import classnames from 'classnames'

import { ModalContext } from './Modal'

import css from './ModalBody.less'

type Props = {
    children: ReactNode
    className?: string
}

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Modal />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
const ModalBody = (
    { children, className }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) => {
    const { isScrollable, bodyId } = useContext(ModalContext)

    return (
        <div
            className={classnames(
                css.wrapper,
                { [css.scrollable]: isScrollable },
                className,
            )}
            id={bodyId}
            ref={forwardedRef}
        >
            {children}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(ModalBody)
