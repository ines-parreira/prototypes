import { RootState } from 'state/types'
import {
    getCommentHighlightsCsatSentiment,
    initialState,
    qualityManagementSlice,
    toggleCommentHighlightsCsatSentiment,
} from 'state/ui/stats/qualityManagementSlice'
import { CsatSentiment } from 'state/ui/stats/types'

describe('qualityManagementSlice reducer', () => {
    it('should return the initial state when an unknown action is passed', () => {
        const state = qualityManagementSlice.reducer(undefined, {
            type: 'unknown',
        })

        expect(state).toEqual(initialState)
    })

    it('should toggle commentHighlightsCsatSentiment from Positive to Negative', () => {
        const previousState = {
            commentHighlightsCsatSentiment: CsatSentiment.Positive,
        }

        const nextState = qualityManagementSlice.reducer(
            previousState,
            toggleCommentHighlightsCsatSentiment(),
        )

        expect(nextState.commentHighlightsCsatSentiment).toEqual(
            CsatSentiment.Negative,
        )
    })

    it('should toggle commentHighlightsCsatSentiment from Negative to Positive', () => {
        const previousState = {
            commentHighlightsCsatSentiment: CsatSentiment.Negative,
        }

        const nextState = qualityManagementSlice.reducer(
            previousState,
            toggleCommentHighlightsCsatSentiment(),
        )

        expect(nextState.commentHighlightsCsatSentiment).toEqual(
            CsatSentiment.Positive,
        )
    })
})

describe('getCommentHighlightsCsatSentiment selector', () => {
    it('should select the commentHighlightsCsatSentiment from the state', () => {
        const state = {
            ui: {
                stats: {
                    [qualityManagementSlice.name]: {
                        commentHighlightsCsatSentiment: CsatSentiment.Negative,
                    },
                },
            },
        } as RootState

        const selected = getCommentHighlightsCsatSentiment(state)

        expect(selected).toEqual(CsatSentiment.Negative)
    })
})
