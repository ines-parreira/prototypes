import React from 'react'
import {Link} from 'react-router-dom'
import {LocationDescriptor} from 'history'

import css from './CustomEntityCard.less'

type Props<T> = {
    description: string
    title: string
    to: LocationDescriptor<T>
}

function CustomEntityCard<T>({description, title, to}: Props<T>) {
    return (
        <Link className={css.container} to={to}>
            <div className={css.header}>
                <i className="material-icons">add_circle</i>
            </div>
            <div className={css.title}>{title}</div>
            <div className={css.description}>{description}</div>
        </Link>
    )
}

export default CustomEntityCard
