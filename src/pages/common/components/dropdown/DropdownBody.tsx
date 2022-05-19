import classnames from 'classnames'
import React, {forwardRef, HTMLAttributes, ReactNode, Ref} from 'react'

import Spinner from 'pages/common/components/Spinner'

import css from './DropdownBody.less'

type Props = {
    children: ReactNode
    className?: string
    isLoading?: boolean
} & HTMLAttributes<HTMLDivElement>

function DropdownBody(
    {children, className, isLoading, ...other}: Props,
    ref: Ref<HTMLDivElement> | null | undefined
) {
    return (
        <div
            className={classnames(css.wrapper, className)}
            ref={ref}
            {...other}
        >
            {isLoading ? (
                <div className={css.spinnerWrapper}>
                    <Spinner className={css.spinner} color="gloom" />
                </div>
            ) : (
                children
            )}
        </div>
    )
}

export default forwardRef(DropdownBody)
