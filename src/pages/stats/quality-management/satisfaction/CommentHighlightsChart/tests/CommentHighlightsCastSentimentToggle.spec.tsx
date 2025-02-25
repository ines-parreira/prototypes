import React from 'react'

import { fireEvent } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import CommentHighlightsToggle, {
    COMMENT_HIGHLIGHTS_CSAT_SENTIMENT_TOGGLE,
} from 'pages/stats/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCsatSentimentToggle'
import { RootState } from 'state/types'
import { QUALITY_MANAGEMENT_SLICE_NAME } from 'state/ui/stats/constants'
import { toggleCommentHighlightsCsatSentiment } from 'state/ui/stats/qualityManagementSlice'
import { CsatSentiment } from 'state/ui/stats/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('state/ui/stats/qualityManagementSlice')
const toggleCommentHighlightsCsatSentimentMock = assumeMock(
    toggleCommentHighlightsCsatSentiment,
)

const dispatchMock = jest.fn()
describe('CommentHighlightsToggle', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    const defaultState = {
        ui: {
            stats: {
                [QUALITY_MANAGEMENT_SLICE_NAME]: {
                    commentHighlightsCsatSentiment: CsatSentiment.Positive,
                },
            },
        },
    } as RootState
    it('renders the toggle buttons correctly', () => {
        const { getByText } = renderWithStore(
            <CommentHighlightsToggle />,
            defaultState,
        )

        Object.values(COMMENT_HIGHLIGHTS_CSAT_SENTIMENT_TOGGLE).forEach(
            (option) => {
                const button = getByText(option.LABEL)

                expect(button).toBeInTheDocument()
            },
        )
    })

    it('calls setSelectedOption when a button is clicked', () => {
        const { getByText } = renderWithStore(
            <CommentHighlightsToggle />,
            defaultState,
        )

        const negativeButton = getByText(
            COMMENT_HIGHLIGHTS_CSAT_SENTIMENT_TOGGLE.NEGATIVE.LABEL,
        )

        fireEvent.click(negativeButton)

        expect(dispatchMock).toHaveBeenCalledTimes(1)
        expect(dispatchMock).toHaveBeenCalledWith(
            toggleCommentHighlightsCsatSentimentMock(),
        )
        expect(toggleCommentHighlightsCsatSentimentMock).toHaveBeenCalled()
    })
})
