import React from 'react'
import {ContentBlock, ContentState, Modifier, SelectionState} from 'draft-js'
import {fromJS} from 'immutable'

import QuotedBlock from './QuotedBlock'

export const QUOTE_DEPTH_DATA_KEY = 'quoteDepth'
const MAX_QUOTE_SEARCH_DEPTH = 100

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

const QuotedElement = ({
    children,
    depth,
    element,
}: {
    children?: React.ReactNode
    depth: number
    element: React.ReactElement
}) => (
    <QuotedBlock depth={depth}>
        {React.cloneElement(element, {children})}
    </QuotedBlock>
)

export const decorateQuotedBlockElement = (
    element: React.ReactElement,
    depth: number
): React.ReactElement => {
    return depth > 0 ? (
        <QuotedElement depth={depth} element={element} />
    ) : (
        element
    )
}

export const decorateQuotedBlockText = (
    blockText: string,
    depth: number
): string => {
    if (depth <= 0) {
        return blockText
    }

    let quotePrefix = ''
    for (let i = 0; i < depth; i++) {
        quotePrefix += '>'
    }

    return quotePrefix + ' ' + blockText
}

export type QuotedHTMLNode = {
    quotedNode: Node
    quoteDepth: number
}

export const getQuotedHtmlNode = (
    element: HTMLElement
): QuotedHTMLNode | null => {
    let quoteDepth = 0
    let quotedNode: Node | null = element

    while (quotedNode && quotedNode.nodeName === 'BLOCKQUOTE') {
        if (quoteDepth > MAX_QUOTE_SEARCH_DEPTH) {
            return null
        }
        quotedNode = quotedNode.firstChild
        quoteDepth++
    }

    if (quotedNode && quoteDepth) {
        return {quotedNode, quoteDepth}
    }

    return null
}
