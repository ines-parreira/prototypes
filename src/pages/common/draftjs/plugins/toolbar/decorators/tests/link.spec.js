import { shallow } from 'enzyme'
import * as React from 'react'

import createLink from '../link'
import { convertFromHTML } from '../../../../../../../utils/editor'
import LinkPopover from '../../components/LinkPopover'

describe('link decorator', () => {
    describe('strategy', () => {
        const link = createLink({
            isActive: () => true,
            onLinkEdit: () => undefined
        })

        it('should select links with entities', () => {
            const html = 'a url <a href="http://google.com">link</a>, http://gorgias.io and <a href="http://google.com">link</a>'
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
        const html = '<a href="http://google.com">link</a>'
        const contentState = convertFromHTML(html)

        it('should render component with onEdit prop if active', () => {
            const editSpy = jest.fn()
            const link = createLink({
                isActive: () => true,
                onLinkEdit: editSpy
            })
            const component = shallow((
                <link.component
                    contentState={contentState}
                    entityKey={contentState.getFirstBlock().getEntityAt(0)}
                />
            ))
            const linkPopover = component.find(LinkPopover).first()
            expect(linkPopover.props().onEdit).toBeDefined()
        })

        it('should render component without onEdit prop if not active', () => {
            const editSpy = jest.fn()
            const link = createLink({
                isActive: () => false,
                onLinkEdit: editSpy
            })
            const component = shallow((
                <link.component
                    contentState={contentState}
                    entityKey={contentState.getFirstBlock().getEntityAt(0)}
                />
            ))
            const linkPopover = component.find(LinkPopover).first()
            expect(linkPopover.props().onEdit).not.toBeDefined()
        })

        it('should not set onDelete prop if url and text are the same', () => {
            const editSpy = jest.fn()
            const url = 'http://google.com'
            const contentState = convertFromHTML(html)
            const link = createLink({
                isActive: () => false,
                onLinkEdit: editSpy
            })
            const component = shallow((
                <link.component
                    contentState={{
                        getEntity: () => ({
                            getData: () => ({
                                url
                            })
                        })
                    }}
                    entityKey={contentState.getFirstBlock().getEntityAt(0)}
                    decoratedText={url}
                />
            ))
            const linkPopover = component.find(LinkPopover).first()
            expect(linkPopover.props().onDelete).not.toBeDefined()
        })
    })
})
