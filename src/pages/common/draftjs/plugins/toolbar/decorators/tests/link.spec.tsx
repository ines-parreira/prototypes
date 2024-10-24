import {render} from '@testing-library/react'
import {ContentState} from 'draft-js'
import * as React from 'react'

import LinkPopover from 'pages/common/draftjs/plugins/toolbar/components/LinkPopover'
import createLink from 'pages/common/draftjs/plugins/toolbar/decorators/link'
import {DecoratorComponentProps} from 'pages/common/draftjs/plugins/types'
import {convertFromHTML} from 'utils/editor'

import {assumeMock, renderWithStore} from 'utils/testing'

jest.mock('pages/common/draftjs/plugins/toolbar/components/LinkPopover')
const LinkPopoverMock = assumeMock(LinkPopover)

describe('link decorator', () => {
    beforeEach(() => {
        LinkPopoverMock.mockImplementation(() => <div></div>)
    })
    describe('strategy', () => {
        const link = createLink({
            isActive: () => true,
            onLinkEdit: () => undefined,
        })

        it('should select links with entities', () => {
            const html =
                'a url <a href="http://google.com">link</a>, http://gorgias.io and <a href="http://google.com">link</a>'
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
        const minProps: DecoratorComponentProps = {
            entityKey: '',
            contentState: ContentState.createFromText(''),
            decoratedText: '',
            getEditorState: jest.fn(),
            setEditorState: jest.fn(),
            offsetKey: '',
        }

        it('should render component with onEdit prop if active', () => {
            const editSpy = jest.fn()
            const link = createLink({
                isActive: () => true,
                onLinkEdit: editSpy,
            })

            renderWithStore(
                <link.component
                    {...minProps}
                    contentState={contentState}
                    entityKey={contentState.getFirstBlock().getEntityAt(0)}
                />,
                {
                    ui: {
                        editor: {
                            isEditingLink: true,
                            isFocused: true,
                        },
                    } as any,
                }
            )

            expect(LinkPopoverMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    onEdit: expect.any(Function),
                }),
                {}
            )
        })

        it('should render component without onEdit prop if not active', () => {
            const editSpy = jest.fn()
            const link = createLink({
                isActive: () => false,
                onLinkEdit: editSpy,
            })

            render(
                <link.component
                    {...minProps}
                    contentState={contentState}
                    entityKey={contentState.getFirstBlock().getEntityAt(0)}
                />
            )

            expect(LinkPopoverMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    onEdit: undefined,
                }),
                {}
            )
        })

        it('should not set onDelete prop if url and text are the same', () => {
            const editSpy = jest.fn()
            const url = 'http://google.com'
            const contentState = convertFromHTML(html)
            const link = createLink({
                isActive: () => false,
                onLinkEdit: editSpy,
            })

            render(
                <link.component
                    {...minProps}
                    contentState={
                        {
                            getEntity: () => ({
                                getData: () => ({
                                    url,
                                }),
                            }),
                        } as unknown as ContentState
                    }
                    entityKey={contentState.getFirstBlock().getEntityAt(0)}
                    decoratedText={url}
                />
            )

            expect(LinkPopoverMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    onDelete: undefined,
                }),
                {}
            )
        })
    })
})
