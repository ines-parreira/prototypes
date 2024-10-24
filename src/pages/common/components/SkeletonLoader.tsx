import classnames from 'classnames'
import React from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import css from './SkeletonLoader.less'

const Row = () => (
    <div className={css.row}>
        <Skeleton
            containerClassName={classnames(css.container, css.icon)}
            height={24}
        />
        <Skeleton
            containerClassName={classnames(css.container, css.line)}
            height={24}
        />
    </div>
)

type Props = {
    className?: string
    length?: number
}

const SkeletonLoader = ({className, length = 3}: Props) => (
    <div className={className}>
        {Array.from({length}).map((_, index) => (
            <Row key={index} />
        ))}
    </div>
)

export default SkeletonLoader
