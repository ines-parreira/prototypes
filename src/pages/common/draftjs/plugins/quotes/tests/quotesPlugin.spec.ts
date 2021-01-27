import {ContentBlock, ContentState, DraftBlockType} from 'draft-js'

import {createQuotesPlugin, WRAPPABLE_BLOCK_TYPES} from '../quotesPlugin'
import {setQuoteDepth} from '../quotesEditorUtils'
import {selectWholeContentState} from '../../../../../../utils/editor'
import styles from '../quotesBlockStyle.less'
import {QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX} from '../QuotesWrapper'

describe('quotesPlugin', () => {
    describe('blockRenderMap', () => {
        it('should define quote wrappers for the wrappable block types', () => {
            const quotesPlugin = createQuotesPlugin()
            expect(quotesPlugin.blockRenderMap.toJS()).toMatchSnapshot()
        })
    })

    describe('blockStyleFn', () => {
        const createContentBlockWithType = (blockType: DraftBlockType) => {
            let contentState = ContentState.createFromText('Foo')
            contentState = ContentState.createFromBlockArray([
                contentState
                    .getFirstBlock()
                    .merge({type: blockType}) as ContentBlock,
            ])
            return contentState.getFirstBlock()
        }

        it('should not apply quote styles for block without quote depth', () => {
            const quotesPlugin = createQuotesPlugin()
            expect(
                quotesPlugin.blockStyleFn(
                    createContentBlockWithType('unstyled')
                )
            ).not.toBeDefined()
        })

        it('should apply quote styles to "unstyled" block type', () => {
            const depth = 3
            const quotesPlugin = createQuotesPlugin()
            let contentState = ContentState.createFromBlockArray([
                createContentBlockWithType('unstyled'),
            ])
            contentState = setQuoteDepth(
                contentState,
                selectWholeContentState(contentState),
                depth
            )

            const style = quotesPlugin.blockStyleFn(
                contentState.getFirstBlock()
            )
            expect(style).toContain(styles.replyThread)
            expect(style).toContain(styles['quoteDepth' + depth.toString()])
        })

        it.each(WRAPPABLE_BLOCK_TYPES)(
            'should apply quoted wrapper styles to "%s" block',
            (blockType: DraftBlockType) => {
                const depth = 3
                const quotesPlugin = createQuotesPlugin()
                let contentState = ContentState.createFromBlockArray([
                    createContentBlockWithType(blockType),
                ])
                contentState = setQuoteDepth(
                    contentState,
                    selectWholeContentState(contentState),
                    depth
                )

                const style = quotesPlugin.blockStyleFn(
                    contentState.getFirstBlock()
                )
                expect(style).toContain(
                    QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX +
                        depth.toString()
                )
            }
        )
    })
})
