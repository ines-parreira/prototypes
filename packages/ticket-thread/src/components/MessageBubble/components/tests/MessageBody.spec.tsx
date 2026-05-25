import { screen } from '@testing-library/react'

import { proxifyURL } from '@repo/utils'
import type * as Utils from '@repo/utils'
import {
    mockTicketMessage,
    mockTicketMessageTranslation,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadRegularMessageItem } from '../../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../../hooks/types'
import { render } from '../../../../tests/render.utils'
import type { DisplayedTicketThreadMessageItem } from '../../../TicketMessage/hooks/useDisplayedTicketMessage'
import { MessageBody } from '../MessageBody'

vi.mock('@repo/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof Utils>()

    return {
        ...actual,
        proxifyURL: vi.fn((url: string, size?: string) =>
            size ? `${url}?proxy=${size}` : `${url}?proxy=cw-1`,
        ),
    }
})

const mockProxifyURL = vi.mocked(proxifyURL)

type MessageBodyData =
    DisplayedTicketThreadMessageItem<TicketThreadRegularMessageItem>['data']

function makeItem(data: MessageBodyData): TicketThreadRegularMessageItem {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data,
        datetime: '2024-03-21T11:00:00Z',
    }
}

function renderMessageBody(data: MessageBodyData) {
    return render(<MessageBody item={makeItem(data)} />)
}

describe('MessageBody', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders plain text content', () => {
        renderMessageBody(
            mockTicketMessage({
                body_html: null,
                body_text: 'Hello world',
                stripped_html: null,
                stripped_text: 'Hello world',
                meta: null,
            }) as TicketThreadRegularMessageItem['data'],
        )

        expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('renders HTML content', () => {
        renderMessageBody(
            mockTicketMessage({
                body_html: '<p>Hello world</p>',
                body_text: null,
                stripped_html: null,
                stripped_text: null,
                meta: null,
            }) as TicketThreadRegularMessageItem['data'],
        )

        expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    it('renders stripped content when message is stripped', () => {
        renderMessageBody(
            mockTicketMessage({
                body_html: null,
                body_text: 'Hello world. And a long quoted reply.',
                stripped_html: null,
                stripped_text: 'Hello world.',
                meta: null,
            }) as TicketThreadRegularMessageItem['data'],
        )

        expect(screen.getByText('Hello world.')).toBeInTheDocument()
        expect(
            screen.queryByText('Hello world. And a long quoted reply.'),
        ).not.toBeInTheDocument()
    })

    it('renders translated stripped content without treating the message as stripped', () => {
        const message = mockTicketMessage({
            body_html: '<p>Hello world</p>',
            body_text: 'Hello world',
            stripped_html: '<p>Hello world</p>',
            stripped_text: 'Hello world',
            meta: null,
        }) as MessageBodyData

        const data: MessageBodyData = {
            ...message,
            translations: mockTicketMessageTranslation({
                stripped_html: '<p>Bonjour le monde</p>',
                stripped_text: 'Bonjour le monde',
            }),
        }

        renderMessageBody(data)

        expect(screen.getByText('Bonjour le monde')).toBeInTheDocument()
    })

    it('shows a truncation banner when the message is too large', () => {
        renderMessageBody(
            mockTicketMessage({
                body_html: null,
                body_text: 'Hello world',
                stripped_html: null,
                stripped_text: 'Hello world',
                meta: { body_text_truncated: true },
            }) as TicketThreadRegularMessageItem['data'],
        )

        expect(
            screen.getByText(
                'This message is too large to display. To see the entire message, open it in the original provider.',
            ),
        ).toBeInTheDocument()
    })

    it('renders a reviewed product when present in the message meta', () => {
        renderMessageBody(
            mockTicketMessage({
                body_html: null,
                body_text: null,
                stripped_html: null,
                stripped_text: null,
                meta: {
                    product: {
                        average_score: 4.3,
                        category: { name: 'Electronics' },
                        description: 'Economic washing machine',
                        images: [
                            {
                                original:
                                    'https://cdn.example.com/product-original.png',
                                square: 'https://cdn.example.com/product-square.png',
                            },
                        ],
                        name: 'Tandem washing machine',
                        total_reviews: 100,
                        url: 'https://www.yotpo.com/product/GGGGG',
                    },
                },
            }) as TicketThreadRegularMessageItem['data'],
        )

        expect(screen.getByText('Reviewed product')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /Tandem washing machine/i }),
        ).toHaveAttribute('href', 'https://www.yotpo.com/product/GGGGG')
        expect(mockProxifyURL).toHaveBeenCalledWith(
            'https://cdn.example.com/product-square.png',
            '120x120',
        )
    })

    it('renders nothing when there is no content', () => {
        const { container } = renderMessageBody(
            mockTicketMessage({
                body_html: null,
                body_text: null,
                stripped_html: null,
                stripped_text: null,
                meta: null,
            }) as TicketThreadRegularMessageItem['data'],
        )

        expect(container).toBeEmptyDOMElement()
    })
})
