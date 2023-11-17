import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {mount, ReactWrapper, shallow, ShallowWrapper} from 'enzyme'
import _noop from 'lodash/noop'
// aphrodite is required by react-images
import {StyleSheetTestUtils} from 'aphrodite'

import {Account} from 'state/currentAccount/types'
import {replaceAttachmentURL} from 'utils'
import TicketAttachments from '../TicketAttachments'

describe('TicketAttachments component', () => {
    beforeAll(() => {
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
    })

    // attachments is an immutable list of pojos
    const attachments: ComponentProps<typeof TicketAttachments>['attachments'] =
        fromJS([
            {
                name: 'foo',
                content_type: 'image/png',
                url: 'https://uploads.gorgi.us/bar',
            },
            {
                name: 'bar',
                content_type: 'text/html',
                url: 'foo',
            },
            {
                name: 'qux',
                content_type: 'application/productCard',
                url: 'http://gorgias.io/bar',
                extra: {
                    price: 2,
                    variant_name: 'quux',
                    product_link: 'http://gorgias.io/bar',
                    currency: 'USD',
                },
            },
        ])

    window.IMAGE_PROXY_URL = 'http://proxy-url/'
    window.IMAGE_PROXY_SIGN_KEY = 'test-key'

    const minProps: ComponentProps<typeof TicketAttachments> = {
        attachments: attachments,
        removable: false,
        deleteAttachment: jest.fn(),
    }

    describe('read-only', () => {
        let component: ShallowWrapper

        beforeAll(() => {
            component = shallow(<TicketAttachments {...minProps} />)
        })

        it('should match snapshot', () => {
            expect(component).toMatchSnapshot()
        })

        it('should display all attachments', () => {
            expect(component.find('.attachmentContainer').length).toBe(
                attachments.size
            )
        })

        it('should set a preview on the first attachment', () => {
            expect(
                (
                    component.children().children().at(0).props() as {
                        style: {backgroundImage: string}
                    }
                ).style?.backgroundImage
            ).toBe(
                `url(${replaceAttachmentURL(
                    'https://uploads.gorgi.us/bar',
                    '120x80'
                )})`
            )
        })

        it('should not set a preview on the second attachment', () => {
            expect(component.children().children().at(1)).toHaveProp(
                'style',
                undefined
            )
        })

        it('should not show the remove button', () => {
            expect(component.find('.itemRemove')).not.toExist()
        })
    })

    describe('removable', () => {
        let component: ShallowWrapper

        beforeAll(() => {
            component = shallow(<TicketAttachments {...minProps} removable />)
        })

        it('should show the remove button', () => {
            expect(component.find('.itemRemove')).toExist()
        })
    })

    describe('lightbox', () => {
        let component: ReactWrapper<ComponentProps<typeof TicketAttachments>>

        beforeEach(() => {
            component = mount<TicketAttachments>(
                <TicketAttachments {...minProps} />
            )

            // aphrodite does not work in jsdom
            StyleSheetTestUtils.suppressStyleInjection()
        })

        afterEach(() => {
            return new Promise((resolve) => {
                StyleSheetTestUtils.clearBufferAndResumeStyleInjection()
                return process.nextTick(resolve)
            })
        })

        it('should list images in lightbox', () => {
            component.setState({
                isLightboxOpen: true,
            })

            expect(document.body.querySelectorAll('figure').length).toBe(1)
        })

        it('should set image src', () => {
            component.setState({
                isLightboxOpen: true,
            })

            expect(document.body.querySelector('img')!.src).toBe(
                replaceAttachmentURL('https://uploads.gorgi.us/bar')
            )
        })

        it('image should open the lightbox', () => {
            component.find('.item').at(0).simulate('click', {
                preventDefault: _noop,
            })

            expect(component.state('isLightboxOpen')).toBe(true)
        })

        it('not-image should not open the lightbox', () => {
            component.find('.item').at(1).simulate('click', {
                preventDefault: _noop,
            })

            expect(component.state('isLightboxOpen')).toBe(false)
        })
    })

    describe('private', () => {
        it("should display an error message if there's private attachments", () => {
            const component = shallow(
                <TicketAttachments
                    {...minProps}
                    attachments={fromJS([
                        {
                            name: 'foo',
                            content_type: 'image/png',
                            url: 'https://uploads.gorgi.us/bar',
                            public: false,
                        },
                        {
                            name: 'bar',
                            content_type: 'image/png',
                            url: 'https://uploads.gorgi.us/baz',
                            public: false,
                        },
                        {
                            name: 'baz',
                            content_type: 'image/png',
                            url: 'https://uploads.gorgi.us/foo',
                            public: false,
                        },
                    ])}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display both an error message and attachments', () => {
            const component = shallow(
                <TicketAttachments
                    {...minProps}
                    attachments={fromJS([
                        {
                            name: 'foo',
                            content_type: 'image/png',
                            url: 'https://uploads.gorgi.us/bar',
                            public: true,
                        },
                        {
                            name: 'bar',
                            content_type: 'image/png',
                            url: 'https://uploads.gorgi.us/baz',
                            public: false,
                        },
                        {
                            name: 'baz',
                            content_type: 'image/png',
                            url: 'https://uploads.gorgi.us/foo',
                            public: true,
                        },
                        {
                            name: 'qux',
                            content_type: 'application/productCard',
                            url: 'http://gorgias.io/bar',
                            extra: {
                                price: 2,
                                variant_name: 'quux',
                                product_link: 'http://gorgias.io/bar',
                                currency: 'USD',
                            },
                        },
                    ])}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
