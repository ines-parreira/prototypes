import {ContentState, SelectionState} from 'draft-js'

import {createQuotesPlugin} from '../quotesPlugin'
import {setQuoteDepth} from '../quotesEditorUtils'

describe('quotesPlugin', () => {
    describe('blockStyleFn', () => {
        it('should apply quote styles for the blocks with quote depth', () => {
            const quotesPlugin = createQuotesPlugin()
            let contentState = ContentState.createFromText('Foo\nBar')
            contentState = setQuoteDepth(
                contentState,
                SelectionState.createEmpty(
                    contentState.getFirstBlock().getKey()
                ).set(
                    'anchorOffset',
                    contentState.getFirstBlock().getLength()
                ) as SelectionState,
                1
            )
            expect(
                quotesPlugin.blockStyleFn(contentState.getFirstBlock())
            ).toMatchSnapshot()
            expect(
                quotesPlugin.blockStyleFn(contentState.getLastBlock())
            ).not.toBeDefined()
        })
    })
})
