import React from 'react'
import {
    ContentBlock,
    DefaultDraftBlockRenderMap,
    DraftBlockRenderConfig,
    DraftBlockType,
} from 'draft-js'

import {EditorBlockType} from '../../../../../utils/editor'

import QuotesWrapper, {
    QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX,
} from './QuotesWrapper'
import {getQuoteDepth} from './quotesEditorUtils'
import styles from './quotesBlockStyle.less'

export const WRAPPABLE_BLOCK_TYPES = [
    EditorBlockType.HeaderOne,
    EditorBlockType.HeaderTwo,
    EditorBlockType.HeaderThree,
    EditorBlockType.HeaderFour,
    EditorBlockType.HeaderFive,
    EditorBlockType.HeaderSix,
    EditorBlockType.UnorderedListItem,
    EditorBlockType.OrderedListItem,
    EditorBlockType.Blockquote,
    EditorBlockType.CodeBlock,
    EditorBlockType.Atomic,
]

export const createQuotesPlugin = () => {
    return {
        blockRenderMap: DefaultDraftBlockRenderMap.map(
            (config: DraftBlockRenderConfig, blockType: DraftBlockType) => {
                return WRAPPABLE_BLOCK_TYPES.indexOf(
                    blockType as EditorBlockType
                ) !== -1
                    ? {
                          ...config,
                          wrapper: (
                              <QuotesWrapper innerWrapper={config.wrapper} />
                          ),
                      }
                    : config
            }
        ),
        blockStyleFn(block: ContentBlock): string | void {
            const quoteDepth = getQuoteDepth(block)
            const type = block.getType()
            if (quoteDepth) {
                return WRAPPABLE_BLOCK_TYPES.indexOf(
                    type as EditorBlockType
                ) !== -1
                    ? QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX +
                          quoteDepth.toString()
                    : [
                          styles.replyThread,
                          styles['quoteDepth' + quoteDepth.toString()],
                      ].join(' ')
            }
        },
    }
}
