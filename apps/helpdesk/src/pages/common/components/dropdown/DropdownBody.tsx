import React, {
    ForwardedRef,
    forwardRef,
    HTMLAttributes,
    ReactNode,
} from 'react'

import classnames from 'classnames'

import { LoadingSpinner } from '@gorgias/axiom'

import css from './DropdownBody.less'

type Props = {
    children: ReactNode
    className?: string
    isLoading?: boolean
} & HTMLAttributes<HTMLDivElement>

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
