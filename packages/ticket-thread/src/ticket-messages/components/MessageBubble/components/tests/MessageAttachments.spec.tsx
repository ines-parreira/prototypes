import { proxifyURL, replaceAttachmentURL, shortcutManager } from '@repo/utils'
import type * as Utils from '@repo/utils'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'
import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { render } from '#tests/render.utils'
import { TicketThreadItemTag } from '#thread/itemTags'
import { MessageAttachments } from '#ticket-messages/components/MessageBubble/components/MessageAttachments'
import type { TicketThreadRegularMessageItem } from '#ticket-messages/types'

vi.mock('@repo/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof Utils>()

    return {
        ...actual,
        replaceAttachmentURL: vi.fn((url: string, size?: string) =>
            size ? `${url}?size=${size}` : `${url}?download=1`,
        ),
        proxifyURL: vi.fn((url: string, size?: string) =>
            size ? `${url}?proxy=${size}` : `${url}?proxy=cw-1`,
        ),
        shortcutManager: {
            pause: vi.fn(),
            unpause: vi.fn(),
        },
    }
})

vi.mock('yet-another-react-lightbox', () => ({
    default: vi.fn(
        ({
            slides,
            open,
            index,
            close,
        }: {
            slides: Array<{ src: string | null | undefined; title?: string }>
            open: boolean
            index: number
            close: () => void
        }) =>
            open ? (
                <div>
                    <div>Lightbox open</div>
                    <div>{slides[index]?.title}</div>
                    <button onClick={close} type="button">
                        Close lightbox
                    </button>
                </div>
            ) : null,
    ),
}))

vi.mock('yet-another-react-lightbox/plugins/thumbnails', () => ({
    default: {},
}))

const mockReplaceAttachmentURL = vi.mocked(replaceAttachmentURL)
const mockProxifyURL = vi.mocked(proxifyURL)
const mockShortcutManagerPause = vi.mocked(shortcutManager.pause)
const mockShortcutManagerUnpause = vi.mocked(shortcutManager.unpause)

function makeItem(attachments: TicketMessageAttachment[]) {
    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: mockTicketMessage({
            attachments,
        }),
        datetime: '2024-03-21T11:00:00Z',
    } as TicketThreadRegularMessageItem
}

function makeAttachment(
    overrides: Partial<TicketMessageAttachment>,
): TicketMessageAttachment {
    return {
        name: 'attachment.png',
        url: 'https://cdn.example.com/attachment.png',
        content_type: 'image/png',
        public: true,
        ...overrides,
    } as TicketMessageAttachment
}

describe('MessageAttachments', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockReplaceAttachmentURL.mockImplementation(
            (url: string, size?: string) =>
                size ? `${url}?size=${size}` : `${url}?download=1`,
        )
    })

    it('renders nothing when there are no attachments', () => {
        const { container } = render(<MessageAttachments item={makeItem([])} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('shows a warning banner for non-public attachments', () => {
        const attachments = [
            makeAttachment({
                name: 'invoice.pdf',
                url: 'https://cdn.example.com/invoice.pdf',
                content_type: 'application/pdf',
                public: false,
            }),
            makeAttachment({
                name: 'photo.png',
                url: 'https://cdn.example.com/photo.png',
                content_type: 'image/png',
                public: false,
            }),
            makeAttachment({
                name: 'public.png',
                url: 'https://cdn.example.com/public.png',
                content_type: 'image/png',
                public: true,
            }),
        ]

        render(<MessageAttachments item={makeItem(attachments)} />)

        expect(
            screen.getByText(
                "There are 2 attachment(s) that couldn't be downloaded.",
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
    })

    it('renders public file and image attachments', async () => {
        const attachments = [
            makeAttachment({
                name: 'preview.png',
                url: 'https://cdn.example.com/preview.png',
                content_type: 'image/png',
            }),
            makeAttachment({
                name: 'terms.pdf',
                url: 'https://cdn.example.com/terms.pdf',
                content_type: 'application/pdf',
            }),
        ]

        render(<MessageAttachments item={makeItem(attachments)} />)

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'preview.png' }),
            ).toBeInTheDocument()
        })
        expect(
            screen.getByRole('link', { name: 'preview.png' }),
        ).toHaveAttribute(
            'href',
            'https://cdn.example.com/preview.png?download=1',
        )
        expect(
            screen.getByRole('link', { name: 'preview.png' }),
        ).toHaveAttribute('target', '_blank')
        expect(
            screen.getByRole('link', { name: 'preview.png' }),
        ).toHaveAttribute('rel', 'noopener noreferrer')
        expect(screen.getByRole('link', { name: 'terms.pdf' })).toHaveAttribute(
            'href',
            'https://cdn.example.com/terms.pdf?download=1',
        )
        expect(screen.getByText('pdf')).toBeInTheDocument()
    })

    it('renders fallback names and hrefs when attachment metadata is missing', () => {
        mockReplaceAttachmentURL.mockReturnValue(null as unknown as string)

        const attachments = [
            makeAttachment({
                name: undefined,
                url: '',
                content_type: 'image/png',
            }),
            makeAttachment({
                name: undefined,
                url: '',
                content_type: 'application/pdf',
            }),
        ]

        render(<MessageAttachments item={makeItem(attachments)} />)

        expect(
            screen.getByRole('link', { name: 'Image attachment' }),
        ).toHaveAttribute('href', '#')
        expect(
            screen.getByRole('link', { name: 'Attachment' }),
        ).toHaveAttribute('href', '#')
        expect(screen.getByText('File')).toBeInTheDocument()
    })

    it('renders a custom regular attachments section header', () => {
        const attachments = [
            makeAttachment({
                name: 'terms.pdf',
                url: 'https://cdn.example.com/terms.pdf',
                content_type: 'application/pdf',
            }),
        ]

        render(
            <MessageAttachments
                item={makeItem(attachments)}
                attachmentsLabel="Files"
            />,
        )

        expect(screen.getByText('Files')).toBeInTheDocument()
        expect(screen.queryByText('Attachments')).not.toBeInTheDocument()
    })

    it('renders linked products and regular attachments in separate sections', async () => {
        const attachments = [
            makeAttachment({
                name: 'manual.pdf',
                url: 'https://cdn.example.com/manual.pdf',
                content_type: 'application/pdf',
            }),
            makeAttachment({
                name: 'Classic Tee',
                url: 'https://cdn.example.com/product.png',
                content_type: 'application/productCard',
                extra: {
                    price: 31.24,
                    compare_at_price: 55.55,
                    variant_name: 'Blue / M',
                    product_link:
                        'https://shop.example.com/products/classic-tee',
                    currency: 'USD',
                },
            }),
        ]

        render(<MessageAttachments item={makeItem(attachments)} />)

        expect(screen.getByText('Attachments')).toBeInTheDocument()
        expect(screen.getByText('Linked products')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'manual.pdf' }),
        ).toHaveAttribute(
            'href',
            'https://cdn.example.com/manual.pdf?download=1',
        )

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'Classic Tee' }),
            ).toHaveAttribute(
                'src',
                'https://cdn.example.com/product.png?proxy=120x120',
            )
        })

        expect(mockProxifyURL).toHaveBeenCalledWith(
            'https://cdn.example.com/product.png',
            '120x120',
        )
    })

    it('renders discount offer attachments in linked products', () => {
        const attachments = [
            makeAttachment({
                name: 'manual.pdf',
                url: 'https://cdn.example.com/manual.pdf',
                content_type: 'application/pdf',
            }),
            makeAttachment({
                name: 'Spring campaign offer',
                url: 'https://cdn.example.com/discount-offer',
                content_type: 'application/discountOffer',
                extra: {
                    discount_offer_code: '10OFF',
                    discount_offer_type: 'percentage',
                    discount_offer_value: 10,
                    discount_offer_id: '10OFF',
                },
            }),
        ]

        render(<MessageAttachments item={makeItem(attachments)} />)

        expect(screen.getByText('Linked products')).toBeInTheDocument()
        expect(screen.getByText('Attachments')).toBeInTheDocument()
        expect(screen.getByText('10OFF')).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: 'manual.pdf' }),
        ).toHaveAttribute(
            'href',
            'https://cdn.example.com/manual.pdf?download=1',
        )
    })

    it('opens the lightbox for the clicked image and pauses shortcuts', async () => {
        const attachments = [
            makeAttachment({
                name: 'first.png',
                url: 'https://cdn.example.com/first.png',
            }),
            makeAttachment({
                name: 'second.png',
                url: 'https://cdn.example.com/second.png',
            }),
        ]

        const { user } = render(
            <MessageAttachments item={makeItem(attachments)} />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'second.png' }),
            ).toBeInTheDocument()
        })
        await act(async () => {
            await user.click(screen.getByRole('img', { name: 'second.png' }))
        })

        expect(screen.getByText('Lightbox open')).toBeInTheDocument()
        expect(screen.getAllByText('second.png').length).toBeGreaterThan(0)
        expect(mockShortcutManagerPause).toHaveBeenCalledTimes(1)
    })

    it.each([
        ['non-primary button', { button: 1 }],
        ['meta key', { metaKey: true }],
        ['control key', { ctrlKey: true }],
        ['shift key', { shiftKey: true }],
        ['alt key', { altKey: true }],
    ])(
        'keeps %s image link clicks available to the browser',
        async (_eventName, clickOptions) => {
            const attachments = [
                makeAttachment({
                    name: 'preview.png',
                    url: 'https://cdn.example.com/preview.png',
                }),
            ]

            render(<MessageAttachments item={makeItem(attachments)} />)

            await waitFor(() => {
                expect(
                    screen.getByRole('link', { name: 'preview.png' }),
                ).toBeInTheDocument()
            })
            fireEvent.click(
                screen.getByRole('link', { name: 'preview.png' }),
                clickOptions,
            )

            expect(screen.queryByText('Lightbox open')).not.toBeInTheDocument()
            expect(mockShortcutManagerPause).not.toHaveBeenCalled()
        },
    )

    it('closes the lightbox and unpauses shortcuts', async () => {
        const attachments = [
            makeAttachment({
                name: 'preview.png',
                url: 'https://cdn.example.com/preview.png',
            }),
        ]

        const { user } = render(
            <MessageAttachments item={makeItem(attachments)} />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('img', { name: 'preview.png' }),
            ).toBeInTheDocument()
        })
        await act(async () => {
            await user.click(screen.getByRole('img', { name: 'preview.png' }))
        })
        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /close lightbox/i }),
            )
        })

        expect(screen.queryByText('Lightbox open')).not.toBeInTheDocument()
        expect(mockShortcutManagerUnpause).toHaveBeenCalledTimes(1)
    })

    it('builds preview and download urls through replaceAttachmentURL', () => {
        const attachments = [
            makeAttachment({
                name: 'preview.png',
                url: 'https://cdn.example.com/preview.png',
                content_type: 'image/png',
            }),
            makeAttachment({
                name: 'manual.pdf',
                url: 'https://cdn.example.com/manual.pdf',
                content_type: 'application/pdf',
            }),
        ]

        render(<MessageAttachments item={makeItem(attachments)} />)

        expect(mockReplaceAttachmentURL).toHaveBeenCalledWith(
            'https://cdn.example.com/preview.png',
        )
        expect(mockReplaceAttachmentURL).toHaveBeenCalledWith(
            'https://cdn.example.com/preview.png',
            '120x80',
        )
        expect(mockReplaceAttachmentURL).toHaveBeenCalledWith(
            'https://cdn.example.com/manual.pdf',
        )
    })
})
