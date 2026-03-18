import { replaceAttachmentURL, shortcutManager } from '@repo/utils'
import type * as Utils from '@repo/utils'
import { act, screen, waitFor } from '@testing-library/react'

import type * as Axiom from '@gorgias/axiom'
import { mockTicketMessage } from '@gorgias/helpdesk-mocks'
import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import type { TicketThreadRegularMessageItem } from '../../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../../hooks/types'
import { render } from '../../../../tests/render.utils'
import { MessageAttachments } from '../MessageAttachments'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = await importOriginal<typeof Axiom>()

    return {
        ...actual,
        Image: vi.fn(
            ({
                src,
                alt,
                onClick,
                className,
                width,
                height,
            }: {
                src: string
                alt: string
                onClick?: () => void
                className?: string
                width?: string
                height?: string
            }) => (
                <img
                    src={src}
                    alt={alt}
                    onClick={onClick}
                    className={className}
                    width={width}
                    height={height}
                />
            ),
        ),
    }
})

vi.mock('@repo/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof Utils>()

    return {
        ...actual,
        replaceAttachmentURL: vi.fn((url: string, size?: string) =>
            size ? `${url}?size=${size}` : `${url}?download=1`,
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
        expect(screen.getByRole('link', { name: 'terms.pdf' })).toHaveAttribute(
            'href',
            'https://cdn.example.com/terms.pdf?download=1',
        )
        expect(screen.getByText('pdf')).toBeInTheDocument()
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
            '120x80',
        )
        expect(mockReplaceAttachmentURL).toHaveBeenCalledWith(
            'https://cdn.example.com/manual.pdf',
        )
    })
})
