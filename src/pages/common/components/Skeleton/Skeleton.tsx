import React, {ComponentProps} from 'react'
import classnames from 'classnames'
import ReactLoadingSkeleton from 'react-loading-skeleton'

import css from './Skeleton.less'

type Props = {
    className?: string
} & ComponentProps<typeof ReactLoadingSkeleton>

const Skeleton = ({className, ...props}: Props) => (
    <ReactLoadingSkeleton
        className={classnames(css.skeleton, className)}
        height={20}
        duration={1.3}
        borderRadius={4}
        {...props}
    />
)

export default Skeleton
