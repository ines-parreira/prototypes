import React from 'react'

import { assumeMock, render } from '@repo/testing'
import { fireEvent } from '@testing-library/react'

import {
    COMMENT_HIGHLIGHTS_CSAT_SENTIMENT_TOGGLE,
    CommentHighlightsToggle,
} from 'domains/reporting/pages/quality-management/satisfaction/CommentHighlightsChart/CommentHighlightsCsatSentimentToggle'
import { QUALITY_MANAGEMENT_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { toggleCommentHighlightsCsatSentiment } from 'domains/reporting/state/ui/stats/qualityManagementSlice'
import { CsatSentiment } from 'domains/reporting/state/ui/stats/types'
import { useAppDispatch } from 'hooks/useAppDispatch'
import type { RootState } from 'state/types'

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
        const { getByText } = render(<CommentHighlightsToggle />, {
            storeState: defaultState,
        })

        Object.values(COMMENT_HIGHLIGHTS_CSAT_SENTIMENT_TOGGLE).forEach(
            (option) => {
                const button = getByText(option.LABEL)

                expect(button).toBeInTheDocument()
            },
        )
    })

    it('calls setSelectedOption when a button is clicked', () => {
        const { getByText } = render(<CommentHighlightsToggle />, {
            storeState: defaultState,
        })

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
