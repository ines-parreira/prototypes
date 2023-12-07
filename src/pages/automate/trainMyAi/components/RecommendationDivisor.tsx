import React from 'react'
import css from './RecommendationDivisor.less'

export default function RecommendationDivisor() {
    return (
        <div className={css.container}>
            <div className={css.content}>
                <div>message</div>
                <div>recommended article</div>
            </div>
            <div className={css.divider}></div>
        </div>
    )
}
