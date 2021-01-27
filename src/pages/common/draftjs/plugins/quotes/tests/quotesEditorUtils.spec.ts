import {ContentState} from 'draft-js'

import {getQuoteDepth, setQuoteDepth} from '../quotesEditorUtils'
import {
    getContentStateBlocksSnapshot,
    selectWholeContentState,
} from '../../../../../../utils/editor'

describe('quotesEditorUtils', () => {
    describe('setQuoteDepth', () => {
        it('should not add the quote when depth is negative', () => {
            let contentState = ContentState.createFromText('Foo')
            contentState = setQuoteDepth(
                contentState,
                selectWholeContentState(contentState),
                -1
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should not add the quote data when depth in 0', () => {
            let contentState = ContentState.createFromText('Foo')
            contentState = setQuoteDepth(
                contentState,
                selectWholeContentState(contentState),
                0
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })

        it('should add the quote data', () => {
            let contentState = ContentState.createFromText('Foo')
            contentState = setQuoteDepth(
                contentState,
                selectWholeContentState(contentState),
                2
            )
            expect(
                getContentStateBlocksSnapshot(contentState)
            ).toMatchSnapshot()
        })
    })

    describe('getQuoteDepth', () => {
        it('should return 0 when there is no quote data', () => {
            const contentState = ContentState.createFromText('Foo')
            expect(getQuoteDepth(contentState.getFirstBlock())).toBe(0)
        })

        it('should return the quote data depth', () => {
            let contentState = ContentState.createFromText('Foo')
            contentState = setQuoteDepth(
                contentState,
                selectWholeContentState(contentState),
                2
            )
            expect(getQuoteDepth(contentState.getFirstBlock())).toBe(2)
        })
    })
})
