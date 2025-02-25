import React from 'react'

import classNames from 'classnames'

import css from './LearnMoreLink.less'

type Props = {
    children: React.ReactNode
    url: string
}

export default function LearnMoreLink({ children, url }: Props) {
    return (
        <a
            href={url}
            rel="noopener noreferrer"
            target="_blank"
            className={css.learnMore}
        >
            <i className={classNames('material-icons', css.icon)}>menu_book</i>
            <div className={css.content}>{children}</div>
        </a>
    )
}
