import React from 'react'

import { fireEvent } from '@testing-library/react'

import CommentHighlightsToggle, {
    COMMENT_HIGHLIGHTS_CSAT_SENTIMENT_TOGGLE,
} from 'domains/reporting/pages/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCsatSentimentToggle'
import { QUALITY_MANAGEMENT_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { toggleCommentHighlightsCsatSentiment } from 'domains/reporting/state/ui/stats/qualityManagementSlice'
import { CsatSentiment } from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('domains/reporting/state/ui/stats/qualityManagementSlice')
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
