import React from 'react'
import {shallow} from 'enzyme'

import {List} from 'immutable'
import TicketAttachments from '../TicketAttachments'

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

    function deleteAttachment() {
    }

    describe('read-only', () => {
        let component

        beforeAll(() => {
            component = shallow(
                <TicketAttachments
                    removable={false}
                    attachments={attachments}
                    deleteAttachment={deleteAttachment}
                />
            )
        })

        it('should display all attachments', () => {
            expect(component.children().length).toBe(attachments.size)
        })

        it('should set a preview on the first attachment', () => {
            expect(component.children().at(0)).toHaveStyle(
                'backgroundImage',
                `url(${window.IMAGE_PROXY_URL}120x80/bar)`
            )
        })

        it('should not set a preview on the second attachment', () => {
            expect(component.children().at(1)).toHaveProp('style', null)
        })

        it('should not show the remove button', () => {
            expect(component.find('.attachments-item-remove')).not.toBePresent()
        })
    })

    describe('removable', () => {
        let component

        beforeAll(() => {
            component = shallow(
                <TicketAttachments
                    removable
                    attachments={attachments}
                    deleteAttachment={deleteAttachment}
                />
            )
        })

        it('should show the remove button', () => {
            expect(component.find('.attachments-item-remove')).toBePresent()
        })
    })
})
