import React from 'react'

import css from './Ellipsis.less'

type Props = {
    title: string
    onClick: () => void
}

const Ellipsis = ({title, onClick}: Props) => (
    <div className={css['btn-more']} title={title} onClick={onClick}>
        &hellip;
    </div>
)

export default Ellipsis
