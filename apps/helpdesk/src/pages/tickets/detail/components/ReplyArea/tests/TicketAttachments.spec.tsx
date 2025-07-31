import React, { ComponentProps } from 'react'

import { userEvent } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { StyleSheetTestUtils } from 'aphrodite'
import { fromJS, List, Map } from 'immutable'

import { AttachmentEnum } from 'common/types'
import * as discountedPriceFlagModule from 'pages/convert/common/hooks/useIsProductCardDiscountedPriceEnabled'
import { Account } from 'state/currentAccount/types'
import { replaceAttachmentURL } from 'utils'

import TicketAttachments from '../TicketAttachments'

describe('TicketAttachments component', () => {
    beforeAll(() => {
        window.GORGIAS_STATE.currentAccount = {
            domain: 'acme',
        } as Account
    })

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
            {
                name: 'Similar Browsed Products',
                content_type: 'application/productRecommendation',
                extra: {
                    id: '01J4VFPQ477Z2CNXAB5ES70GN3',
                    scenario: 'similar_seen',
                },
            },
            {
                name: 'Contact Form',
                content_type: AttachmentEnum.ContactForm,
                extra: {
                    steps: [
                        {
                            fields: [
                                {
                                    name: 'email',
                                    type: 'email',
                                    required: true,
                                    label: 'Enter your email',
                                },
                            ],
                            cta: 'Subscribe now!',
                        },
                    ],
                    disclaimer: 'Disclaimer',
                    on_success_content: {
                        message: 'Congrats',
                    },
                    targets: [
                        {
                            type: 'shopify',
                            subscriber_types: ['email', 'sms'],
                            tags: [],
                        },
                    ],
                },
            },
        ])

    window.IMAGE_PROXY_URL = 'http://proxy-url/'
    window.IMAGE_PROXY_SIGN_KEY = 'test-key'

    const minProps: ComponentProps<typeof TicketAttachments> = {
        context: 'campaign-message',
        attachments: attachments,
        removable: false,
        deleteAttachment: jest.fn(),
    }

    describe('read-only', () => {
        it('should match snapshot', () => {
            const { container } = render(<TicketAttachments {...minProps} />)
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display all attachments', () => {
            render(<TicketAttachments {...minProps} />)
            expect(
                document.getElementsByClassName('attachmentContainer').length,
            ).toBe(attachments.size)
        })

        it('should set a preview on the first attachment', () => {
            render(<TicketAttachments {...minProps} />)
            expect(screen.getAllByRole('link')[0]).toHaveStyle(
                `backgroundImage: url(${replaceAttachmentURL(
                    'https://uploads.gorgi.us/bar',
                    '120x80',
                )})`,
            )
        })

        it('should not set a preview on the second attachment', () => {
            render(<TicketAttachments {...minProps} />)
            expect(screen.getAllByRole('link')[1]).not.toHaveAttribute('style')
        })

        it('should not show the remove button', () => {
            expect(
                document.getElementsByClassName('itemRemove').length,
            ).toEqual(0)
        })
    })

    describe('removable', () => {
        it('should show the remove button', () => {
            render(<TicketAttachments {...minProps} removable />)

            expect(
                document.getElementsByClassName('itemRemove').length,
            ).toBeGreaterThan(0)
        })
    })

    describe('lightbox', () => {
        beforeEach(() => {
            render(<TicketAttachments {...minProps} />)

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
            act(() => {
                userEvent.click(screen.getAllByRole('link')[0])
            })

            expect(document.body.querySelectorAll('figure').length).toBe(1)
        })

        it('should set image src', () => {
            act(() => {
                userEvent.click(screen.getAllByRole('link')[0])
            })

            expect(document.getElementsByTagName('img')[1]).toHaveAttribute(
                'src',
                'https://uploads.gorgi.us/bar',
            )
        })

        it('image should open the lightbox', () => {
            act(() => {
                userEvent.click(document.getElementsByClassName('item')[0])
            })

            expect(document.body.querySelectorAll('figure').length).toBe(1)
        })

        it('not-image should not open the lightbox', () => {
            act(() => {
                userEvent.click(document.getElementsByClassName('item')[1])
            })

            expect(document.body.querySelectorAll('figure').length).toBe(0)
        })
    })

    describe('private', () => {
        it("should display an error message if there's private attachments", () => {
            const { container } = render(
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
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display both an error message and attachments', () => {
            const attachments = fromJS([
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
                {
                    name: 'quxx',
                    content_type: 'application/productCard',
                    url: 'http://gorgias.io/quxx',
                    extra: {
                        price: 31.24,
                        compare_at_price: 55.55,
                        variant_name: 'quux',
                        product_link: 'http://gorgias.io/quxx',
                        currency: 'USD',
                    },
                },
            ]) as List<Map<string, string>>
            const { getByText, queryByText } = render(
                <TicketAttachments {...minProps} attachments={attachments} />,
            )

            expect(getByText('warning')).toBeInTheDocument()
            expect(getByText(/we couldn't download/)).toBeInTheDocument()
            expect(
                getByText(attachments.getIn([0, 'name'])),
            ).toBeInTheDocument()
            expect(
                queryByText(attachments.getIn([1, 'name'])),
            ).not.toBeInTheDocument()
            expect(
                getByText(attachments.getIn([2, 'name'])),
            ).toBeInTheDocument()
            expect(
                getByText(attachments.getIn([3, 'name'])),
            ).toBeInTheDocument()
            expect(getByText('$2.00')).toBeInTheDocument()
        })

        it('should display Shopify product type attachments with missing extra', () => {
            const attachments = fromJS([
                {
                    name: 'qux',
                    content_type: 'application/productCard',
                    url: 'http://gorgias.io/bar',
                },
            ]) as List<Map<string, string>>
            const { getAllByText } = render(
                <TicketAttachments {...minProps} attachments={attachments} />,
            )

            expect(getAllByText(attachments.getIn([0, 'name']))).toHaveLength(2)
        })

        const attachments = fromJS([
            {
                name: 'quxx',
                content_type: 'application/productCard',
                url: 'http://gorgias.io/quxx',
                extra: {
                    price: 31.24,
                    compare_at_price: 55.55,
                    variant_name: 'quux',
                    product_link: 'http://gorgias.io/quxx',
                    currency: 'USD',
                },
            },
        ]) as List<Map<string, string>>

        it('should display compare-at price if flag is enabled', () => {
            jest.spyOn(
                discountedPriceFlagModule,
                'getIsProductCardDiscountedPriceEnabled',
            ).mockReturnValue(true)

            const { getByText } = render(
                <TicketAttachments {...minProps} attachments={attachments} />,
            )

            getByText('$31.24')
            getByText('$55.55')
        })

        it('should display compare-at price if flag is disabled', () => {
            jest.spyOn(
                discountedPriceFlagModule,
                'getIsProductCardDiscountedPriceEnabled',
            ).mockReturnValue(false)

            const { getByText, queryByText } = render(
                <TicketAttachments {...minProps} attachments={attachments} />,
            )

            getByText('$31.24')
            expect(queryByText('$55.55')).not.toBeInTheDocument()
        })
    })
})
