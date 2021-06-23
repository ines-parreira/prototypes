import React from 'react'
import classnames from 'classnames'

import css from './Ellipsis.less'

type Props = {
    title: string
    className?: string
    onClick: () => void
}

const Ellipsis = ({title, onClick, className}: Props) => (
    <div
        className={classnames(css['btn-more'], className)}
        title={title}
        onClick={onClick}
    >
        &hellip;
    </div>
)

export default Ellipsis
