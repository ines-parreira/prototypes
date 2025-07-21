import { createSlice } from '@reduxjs/toolkit'

import { QUALITY_MANAGEMENT_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import { CsatSentiment } from 'domains/reporting/state/ui/stats/types'
import { RootState } from 'state/types'

export type QualityManagementState = {
    commentHighlightsCsatSentiment: CsatSentiment
}

export const initialState: QualityManagementState = {
    commentHighlightsCsatSentiment: CsatSentiment.Positive,
}

export const qualityManagementSlice = createSlice({
    name: QUALITY_MANAGEMENT_SLICE_NAME,
    initialState,
    reducers: {
        toggleCommentHighlightsCsatSentiment(state) {
            state.commentHighlightsCsatSentiment =
                state.commentHighlightsCsatSentiment === CsatSentiment.Positive
                    ? CsatSentiment.Negative
                    : CsatSentiment.Positive
        },
    },
})

export const { toggleCommentHighlightsCsatSentiment } =
    qualityManagementSlice.actions

export const getCommentHighlightsCsatSentiment = (state: RootState) =>
    state.ui.stats[qualityManagementSlice.name].commentHighlightsCsatSentiment
