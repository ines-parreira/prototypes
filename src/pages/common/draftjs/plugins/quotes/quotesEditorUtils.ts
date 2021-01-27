import {ContentBlock, ContentState, Modifier, SelectionState} from 'draft-js'
import {fromJS} from 'immutable'

export const QUOTE_DEPTH_DATA_KEY = 'quoteDepth'

export const getQuoteDepth = (block: ContentBlock): number => {
    return block.getData().get(QUOTE_DEPTH_DATA_KEY, 0) as number
}

export const setQuoteDepth = (
    contentState: ContentState,
    selection: SelectionState,
    depth: number
): ContentState => {
    if (depth <= 0) {
        return contentState
    }
    return Modifier.mergeBlockData(
        contentState,
        selection,
        fromJS({[QUOTE_DEPTH_DATA_KEY]: depth})
    )
}
