import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'
// aphrodite is required by react-images
import {StyleSheetTestUtils} from 'aphrodite'

import {fromJS} from 'immutable'
import TicketAttachments from '../TicketAttachments'

describe('TicketAttachments component', () => {
    // attachments is an immutable list of pojos
    const attachments = fromJS([{
        name: 'foo',
        content_type: 'image/png',
        url: 'bar'
    }, {
        name: 'bar',
        content_type: 'text/html',
        url: 'foo'
    }])

    describe('read-only', () => {
        let component

        beforeAll(() => {
            component = shallow(
                <TicketAttachments
                    removable={false}
                    attachments={attachments}
                    deleteAttachment={_noop}
                />
            )
        })

        it('should match snapshot', () => {
            expect(component).toMatchSnapshot()
        })

        it('should display all attachments', () => {
            expect(component.find('.item').length).toBe(attachments.size)
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
            expect(component.find('.itemRemove')).not.toBePresent()
        })
    })

    describe('removable', () => {
        let component

        beforeAll(() => {
            component = shallow(
                <TicketAttachments
                    removable
                    attachments={attachments}
                    deleteAttachment={_noop}
                />
            )
        })

        it('should show the remove button', () => {
            expect(component.find('.itemRemove')).toBePresent()
        })
    })

    describe('lightbox', () => {
        let component

        beforeEach(() => {
            component = mount(
                <TicketAttachments
                    removable={false}
                    attachments={attachments}
                    deleteAttachment={_noop}
                />
            )

            // aphrodite does not work in jsdom
            StyleSheetTestUtils.suppressStyleInjection()
        })

        it('should list images in lightbox', () => {
            component.setState({
                isLightboxOpen: true
            })

            expect(document.body.querySelectorAll('figure').length).toBe(1)
        })

        it('should set image src', () => {
            component.setState({
                isLightboxOpen: true
            })

            expect(document.body.querySelector('img').src).toBe('bar')
        })

        it('image should open the lightbox', () => {
            component.find('.item').at(0).simulate('click', {
                preventDefault: _noop
            })

            expect(component.state('isLightboxOpen')).toBe(true)
        })

        it('not-image should not open the lightbox', () => {
            component.find('.item').at(1).simulate('click', {
                preventDefault: _noop
            })

            expect(component.state('isLightboxOpen')).toBe(false)
        })
    })

    describe('private', () => {
        it('should display an error message if there\'s private attachments', () => {
            const component = shallow(
                <TicketAttachments
                    attachments={fromJS([{
                        name: 'foo',
                        content_type: 'image/png',
                        url: 'bar',
                        public: false
                    }, {
                        name: 'bar',
                        content_type: 'image/png',
                        url: 'baz',
                        public: false
                    }, {
                        name: 'baz',
                        content_type: 'image/png',
                        url: 'foo',
                        public: false
                    }])}
                    deleteAttachment={_noop}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display both an error message and attachments', () => {
            const component = shallow(
                <TicketAttachments
                    attachments={fromJS([{
                        name: 'foo',
                        content_type: 'image/png',
                        url: 'bar',
                        public: true
                    }, {
                        name: 'bar',
                        content_type: 'image/png',
                        url: 'baz',
                        public: false
                    }, {
                        name: 'baz',
                        content_type: 'image/png',
                        url: 'foo',
                        public: true
                    }])}
                    deleteAttachment={_noop}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
