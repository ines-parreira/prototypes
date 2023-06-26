import React from 'react'
import {Link} from 'react-router-dom'

import css from './Card.less'

export type CardProps = {
    children: React.ReactNode
    title: string | React.ReactNode
    link?: {
        text: string
        url: string
    }
}

const Card = ({children, title, link}: CardProps) => {
    return (
        <div className={css.container}>
            <div className={css.header}>
                <h2 className={css.title}>{title}</h2>
                {link && (
                    <Link className={css.link} to={link.url} target="_blank">
                        {link.text}
                        <i className="material-icons">open_in_new</i>
                    </Link>
                )}
            </div>
            <div className={css.body}>{children}</div>
        </div>
    )
}

export default Card
