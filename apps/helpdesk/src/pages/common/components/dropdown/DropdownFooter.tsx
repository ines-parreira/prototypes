import React, { ForwardedRef, forwardRef, HTMLProps } from 'react'

import classnames from 'classnames'

import css from './DropdownFooter.less'

const DropdownFooter = (
    { children, className, ...other }: HTMLProps<HTMLDivElement>,
    ref: ForwardedRef<HTMLDivElement>,
) => (
    <div className={classnames(css.wrapper, className)} ref={ref} {...other}>
        {children}
    </div>
)

export default forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
    DropdownFooter,
)
