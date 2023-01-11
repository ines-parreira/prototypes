import React from 'react'
import classnames from 'classnames'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import css from './SpotlightLoader.less'

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
}

const SpotlightLoader = ({className}: Props) => (
    <div className={className}>
        {Array.from({length: 3}).map((_, index) => (
            <Row key={index} />
        ))}
    </div>
)

export default SpotlightLoader
