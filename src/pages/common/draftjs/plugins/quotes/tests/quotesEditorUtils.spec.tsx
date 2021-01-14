import React from 'react'
import {ContentState} from 'draft-js'
import {render} from '@testing-library/react'

import {
    decorateQuotedBlockElement,
    decorateQuotedBlockText,
    getQuoteDepth,
    getQuotedHtmlNode,
    setQuoteDepth,
} from '../quotesEditorUtils'
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

    describe('decorateQuotedBlockElement', () => {
        it('should return quoted element', () => {
            const {container} = render(decorateQuotedBlockElement(<div />, 2))
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should return the element when quote depth is 0', () => {
            const {container} = render(decorateQuotedBlockElement(<span />, 0))
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render quoted element children', () => {
            const element = decorateQuotedBlockElement(<div />, 1)
            const {container} = render(
                React.cloneElement(element, {children: 'Foo'})
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('decorateQuotedBlockText', () => {
        it('should quote text with ">"', () => {
            expect(decorateQuotedBlockText('foo', 2)).toBe('>> foo')
        })

        it('should return the unmodified text if quote depth is 0', () => {
            expect(decorateQuotedBlockText('foo', 0)).toBe('foo')
        })
    })

    describe('getQuotedHtmlNode', () => {
        const createHTMLElement = (html: string): HTMLElement => {
            const htmlContainer = document.createElement('div')
            htmlContainer.innerHTML = html
            return htmlContainer.firstChild as HTMLElement
        }

        it('should return null when there node is not quoted', () => {
            const element = createHTMLElement('<div>Foo</div>')
            expect(getQuotedHtmlNode(element)).toBe(null)
        })

        it('should return quoted node', () => {
            const element = createHTMLElement(
                '<blockquote><blockquote><span>Foo</span></blockquote></blockquote>'
            )
            expect(getQuotedHtmlNode(element)).toMatchSnapshot()
        })

        it('should return null when quote is empty', () => {
            const element = createHTMLElement(
                '<blockquote><blockquote></blockquote></blockquote>'
            )
            expect(getQuotedHtmlNode(element)).toBe(null)
        })

        it('should return quoted text node', () => {
            const element = createHTMLElement(
                '<blockquote><blockquote>Foo</blockquote></blockquote>'
            )
            expect(getQuotedHtmlNode(element)).toMatchSnapshot()
        })
    })
})
