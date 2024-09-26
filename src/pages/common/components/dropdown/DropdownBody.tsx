import classnames from 'classnames'
import React, {forwardRef, ForwardedRef, HTMLAttributes, ReactNode} from 'react'

import Spinner from 'pages/common/components/Spinner'

import css from './DropdownBody.less'

type Props = {
    children: ReactNode
    className?: string
    isLoading?: boolean
} & HTMLAttributes<HTMLDivElement>

function DropdownBody(
    {children, className, isLoading, ...other}: Props,
    ref: ForwardedRef<HTMLDivElement>
) {
    return (
        <div
            className={classnames(css.wrapper, className)}
            ref={ref}
            {...other}
        >
            {isLoading ? (
                <div className={css.spinnerWrapper}>
                    <Spinner size="medium" />
                </div>
            ) : (
                children
            )}
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(DropdownBody)
