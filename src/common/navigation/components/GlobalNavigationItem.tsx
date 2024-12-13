import cn from 'classnames'
import React from 'react'
import {Link} from 'react-router-dom'

import css from './GlobalNavigationItem.less'

type Props = {
    icon: string
    isActive?: boolean
    url: string
}

export default function GlobalNavigationItem({icon, isActive, url}: Props) {
    return (
        <Link className={cn(css.icon, {[css.active]: !!isActive})} to={url}>
            <i className="material-icons-round">{icon}</i>
        </Link>
    )
}
