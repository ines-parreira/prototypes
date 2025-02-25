import * as React from 'react'

import { render } from '@testing-library/react'
import { ContentState } from 'draft-js'

import { convertFromHTML } from 'utils/editor'

import { DecoratorComponentProps } from '../../../types'
import discountCodeLink from '../discountCodeLink'

describe('discountCodeLink decorator', () => {
    describe('strategy', () => {
        const link = discountCodeLink()

        it('should select links with entities', () => {
            const html =
                'a url <a href="http://shop.com/discount/ABC" data-discount-code="ABC">link</a>, http://gorgias.io and <a href="http://shop.com/discount/DEF" data-discount-code="DEF">link</a>'
            const contentState = convertFromHTML(html)
            const block = contentState.getFirstBlock()
            const spy = jest.fn()
            link.strategy(block, spy, contentState)
            expect(spy.mock.calls.length).toBe(2)
            expect(spy.mock.calls[0]).toEqual([6, 10])
            expect(spy.mock.calls[1]).toEqual([34, 38])
        })
    })

    describe('component', () => {
        const html =
            '<a href="http://shop.com/discount/ABC" data-discount-code="ABC">link</a>'
        const contentState = convertFromHTML(html)
        const minProps: DecoratorComponentProps = {
            entityKey: '',
            contentState: ContentState.createFromText(''),
            decoratedText: '',
            getEditorState: jest.fn(),
            setEditorState: jest.fn(),
            offsetKey: '',
        }

        it('should render component with onEdit prop if active', () => {
            const link = discountCodeLink()
            const { container } = render(
                <link.component
                    {...minProps}
                    contentState={contentState}
                    entityKey={contentState.getFirstBlock().getEntityAt(0)}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
