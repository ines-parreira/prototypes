import type { ForwardedRef, HTMLProps } from 'react'
import React, { forwardRef } from 'react'

import classnames from 'classnames'

import css from './DropdownFooter.less'

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Menu />` or `<Select />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
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
