import {ContentBlock} from 'draft-js'

import {getQuoteDepth} from './quotesEditorUtils'

import styles from './quotesBlockStyle.less'

export const createQuotesPlugin = () => {
    return {
        blockStyleFn(block: ContentBlock): string | void {
            const depth = getQuoteDepth(block)
            if (depth) {
                return (
                    styles.replyThread +
                    ' ' +
                    styles['quoteDepth' + depth.toString()]
                )
            }
        },
    }
}
