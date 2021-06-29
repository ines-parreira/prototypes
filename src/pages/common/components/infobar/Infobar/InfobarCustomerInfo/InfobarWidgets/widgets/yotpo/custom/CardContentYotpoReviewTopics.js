// @flow
import React from 'react'

import {Badge} from 'reactstrap'

import css from './CardContentYotpoReviewTopics.less'

type Props = {
    children: Node,
}

export function CardContentYotpoReviewTopics({children}: Props) {
    let topics = []

    if (children) {
        Object.keys(children).forEach((key) => {
            topics.push(
                <Badge key={key} className={css.topic}>
                    {/* $FlowFixMe */}
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
