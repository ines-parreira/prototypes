import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {List} from 'immutable'
import TicketAttachments from '../TicketAttachments'

expect.extend(expectImmutable)

describe('TicketAttachments component', () => {
    // attachments is an immutable list of pojos
    const attachments = new List().push({
        name: 'foo',
        content_type: 'image/png',
        url: 'bar'
    }, {
        name: 'bar',
        content_type: 'text/html',
        url: 'foo'
    })

    function deleteAttachment() {}

    describe('read-only', () => {
        let component

        before('render element', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
                <TicketAttachments
                    removable={false}
                    attachments={attachments}
                    deleteAttachment={deleteAttachment}
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should display all attachments', () => {
            const attachmentsList = component.props.children
            expect(attachmentsList.size).toBe(attachments.size)
        })

        it('should set a preview on the first attachment', () => {
            const attachment = component.props.children.get(0)

            expect(attachment.props.style.backgroundImage).toBe('url(bar)')
        })

        it('should not set a preview on the second attachment', () => {
            const attachment = component.props.children.get(1)

            expect(attachment.props.style).toBe(null)
        })

        it('should not show the remove button', () => {
            const attachment = component.props.children.get(0).props.children

            expect(attachment.props.children[2]).toBe(null)
        })
    })

    describe('removable', () => {
        let component

        before('render element', () => {
            const renderer = TestUtils.createRenderer()

            renderer.render(
                <TicketAttachments
                    removable
                    attachments={attachments}
                    deleteAttachment={deleteAttachment}
                />
            )

            component = renderer.getRenderOutput()
        })

        it('should show the remove button', () => {
            const attachment = component.props.children.get(0).props.children

            expect(attachment.props.children[2]).toNotBe(null)
        })
    })
})
