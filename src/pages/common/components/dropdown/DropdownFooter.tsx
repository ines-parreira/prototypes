import classnames from 'classnames'
import React, {forwardRef, ForwardedRef, HTMLProps} from 'react'

import css from './DropdownFooter.less'

const DropdownFooter = (
    {children, className, ...other}: HTMLProps<HTMLDivElement>,
    ref: ForwardedRef<HTMLDivElement>
) => (
    <div className={classnames(css.wrapper, className)} ref={ref} {...other}>
        {children}
    </div>
)

export default forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>(
    DropdownFooter
)
