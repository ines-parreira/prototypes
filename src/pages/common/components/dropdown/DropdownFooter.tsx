import classnames from 'classnames'
import React, {forwardRef, HTMLProps, Ref} from 'react'

import css from './DropdownFooter.less'

const DropdownFooter = forwardRef(
    (
        {children, className, ...other}: HTMLProps<HTMLDivElement>,
        ref: Ref<HTMLDivElement> | null | undefined
    ) => (
        <div
            className={classnames(css.wrapper, className)}
            ref={ref}
            {...other}
        >
            {children}
        </div>
    )
)

export default DropdownFooter
