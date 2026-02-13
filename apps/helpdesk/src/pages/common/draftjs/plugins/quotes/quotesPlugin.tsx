import type {
    ContentBlock,
    DraftBlockRenderConfig,
    DraftBlockType,
} from 'draft-js'
import { DefaultDraftBlockRenderMap } from 'draft-js'

import { EditorBlockType } from '../../../../../utils/editor'
import { getQuoteDepth } from './quotesEditorUtils'
import QuotesWrapper, {
    QUOTES_WRAPPER_INNER_ELEMENT_CLASS_NAME_PREFIX,
} from './QuotesWrapper'

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
                const isListType =
                    blockType === EditorBlockType.OrderedListItem ||
                    blockType === EditorBlockType.UnorderedListItem

                const resolvedConfig = isListType
                    ? { ...config, element: 'div' as const }
                    : config

                return WRAPPABLE_BLOCK_TYPES.indexOf(
                    blockType as EditorBlockType,
                ) !== -1
                    ? {
                          ...resolvedConfig,
                          wrapper: (
                              <QuotesWrapper
                                  innerWrapper={
                                      isListType ? (
                                          <div
                                              className={
                                                  blockType ===
                                                  EditorBlockType.OrderedListItem
                                                      ? 'list-wrapper list-wrapper-ol'
                                                      : 'list-wrapper list-wrapper-ul'
                                              }
                                          />
                                      ) : (
                                          resolvedConfig.wrapper
                                      )
                                  }
                              />
                          ),
                      }
                    : resolvedConfig
            },
        ),
        blockStyleFn(block: ContentBlock): string | void {
            const quoteDepth = getQuoteDepth(block)
            const type = block.getType()
            if (quoteDepth) {
                return WRAPPABLE_BLOCK_TYPES.indexOf(
                    type as EditorBlockType,
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
