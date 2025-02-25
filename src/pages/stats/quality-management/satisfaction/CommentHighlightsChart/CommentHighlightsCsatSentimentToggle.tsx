import React from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import {
    getCommentHighlightsCsatSentiment,
    toggleCommentHighlightsCsatSentiment,
} from 'state/ui/stats/qualityManagementSlice'
import { CsatSentiment } from 'state/ui/stats/types'

export const COMMENT_HIGHLIGHTS_CSAT_SENTIMENT_TOGGLE = {
    POSITIVE: { LABEL: 'Positive', VALUE: CsatSentiment.Positive },
    NEGATIVE: { LABEL: 'Negative', VALUE: CsatSentiment.Negative },
}

export default function CommentHighlightsToggle() {
    const commentHighlightsCsatSentiment = useAppSelector(
        getCommentHighlightsCsatSentiment,
    )
    const dispatch = useAppDispatch()

    const toggleHandler = () => dispatch(toggleCommentHighlightsCsatSentiment())

    return (
        <ToggleButton.Wrapper
            type={ToggleButton.Type.Label}
            value={commentHighlightsCsatSentiment}
            onChange={toggleHandler}
            size={'small'}
        >
            {Object.values(COMMENT_HIGHLIGHTS_CSAT_SENTIMENT_TOGGLE).map(
                ({ VALUE, LABEL }) => (
                    <ToggleButton.Option key={VALUE} value={VALUE}>
                        {LABEL}
                    </ToggleButton.Option>
                ),
            )}
        </ToggleButton.Wrapper>
    )
}
