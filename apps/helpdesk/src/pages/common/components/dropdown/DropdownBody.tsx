import type { ForwardedRef, HTMLAttributes, ReactNode } from 'react'
import React, { forwardRef } from 'react'

import classnames from 'classnames'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import css from './DropdownBody.less'

type Props = {
    children: ReactNode
    className?: string
    isLoading?: boolean
} & HTMLAttributes<HTMLDivElement>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Menu />` or `<Select />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
function DropdownBody(
    { children, className, isLoading, ...other }: Props,
    ref: ForwardedRef<HTMLDivElement>,
) {
    return (
        <div
            className={classnames(css.wrapper, className)}
            ref={ref}
            {...other}
        >
            {isLoading ? (
                <div className={css.spinnerWrapper}>
                    <LoadingSpinner />
                </div>
            ) : (
                children
            )}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(DropdownBody)
