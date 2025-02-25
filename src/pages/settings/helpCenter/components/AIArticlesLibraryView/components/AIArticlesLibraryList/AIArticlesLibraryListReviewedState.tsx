import React from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import useEffectOnce from 'hooks/useEffectOnce'

import css from './AIArticlesLibraryList.less'

const AIArticlesLibraryListReviewedState = () => {
    useEffectOnce(() => {
        logEvent(SegmentEvent.HelpCenterAILibraryConfettiScreenViewed)
    })

    return (
        <div className={css.centeredMessage}>
            <div className={css.messageContainer}>
                <span role="img" aria-label="Hooray" className={css.hooray}>
                    🎉
                </span>
                <h3>Great work!</h3>
                <div>{`You've reviewed every article.`}</div>
                <div>{`We'll notify you when new articles are generated.`}</div>
            </div>
        </div>
    )
}

export default AIArticlesLibraryListReviewedState
