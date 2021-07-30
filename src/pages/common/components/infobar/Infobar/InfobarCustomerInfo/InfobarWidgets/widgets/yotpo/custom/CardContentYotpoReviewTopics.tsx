import React, {ReactNode} from 'react'
import {Badge} from 'reactstrap'

import css from './CardContentYotpoReviewTopics.less'

type Props = {
    children: Record<string, ReactNode>
}

export function CardContentYotpoReviewTopics({children}: Props) {
    const topics: ReactNode[] = []

    if (children) {
        Object.keys(children).forEach((key) => {
            topics.push(
                <Badge key={key} className={css.topic}>
                    {children[key]}
                </Badge>
            )
        })
    }

    return (
        <div className={css.topTopicsContainer}>
            <span className={css.container}>
                <span className={css.label}>
                    <span className={`material-icons ${css.favorite}`}>
                        favorite
                    </span>
                    Top Topics
                </span>
            </span>
            <span className={css.topics}>{topics}</span>
        </div>
    )
}
