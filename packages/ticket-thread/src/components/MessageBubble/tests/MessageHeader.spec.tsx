import { render, screen } from '@testing-library/react'

import { Avatar } from '@gorgias/axiom'
import type * as Axiom from '@gorgias/axiom'

import { useTicketThreadDateTimeFormat } from '../../../hooks/shared/useTicketThreadDateTimeFormat'
import type { MessageHeaderProps } from '../MessageHeader'
import { MessageHeader } from '../MessageHeader'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = await importOriginal<typeof Axiom>()
    const OriginalAvatar = actual.Avatar
    return {
        ...actual,
        Avatar: vi.fn((props: any) => <OriginalAvatar {...props} />),
    }
})

vi.mock('../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

const mockAvatar = vi.mocked(Avatar)
const mockUseTicketThreadDateTimeFormat = vi.mocked(
    useTicketThreadDateTimeFormat,
)

const baseProps: MessageHeaderProps = {
    senderName: 'Jane Doe',
    senderAvatarUrl: undefined,
    channelIcon: null,
    createdDatetime: '2024-03-21T00:00:00Z',
    shouldShowStatus: false,
    deliveryStatus: {
        failed_datetime: null,
        isPending: false,
        opened_datetime: null,
        sent_datetime: null,
    },
}

beforeEach(() => {
    mockUseTicketThreadDateTimeFormat.mockReturnValue({
        datetimeFormat: 'YYYY-MM-DD',
        timezone: undefined,
    })
})

function renderHeader(props: Partial<MessageHeaderProps> = {}) {
    return render(<MessageHeader {...baseProps} {...props} />)
}

describe('MessageHeader', () => {
    it('renders the sender name', () => {
        renderHeader()

        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    it('falls back to sender email when name is not available', () => {
        renderHeader({ senderName: 'jane@example.com' })

        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('renders the formatted datetime', () => {
        renderHeader()

        expect(screen.getByText('2024-03-21')).toBeInTheDocument()
    })

    it('formats the datetime using the agent timezone when provided', () => {
        mockUseTicketThreadDateTimeFormat.mockReturnValue({
            datetimeFormat: 'YYYY-MM-DD HH:mm',
            timezone: 'America/Los_Angeles',
        })

        renderHeader()

        expect(screen.getByText('2024-03-20 17:00')).toBeInTheDocument()
    })

    it('passes the sender profile picture url to Avatar', () => {
        const profilePictureUrl = 'https://example.com/avatar.jpg'

        renderHeader({ senderAvatarUrl: profilePictureUrl })

        expect(mockAvatar).toHaveBeenCalledWith(
            expect.objectContaining({ url: profilePictureUrl }),
            expect.anything(),
        )
    })

    it('renders the avatar initials when no profile picture is available', () => {
        renderHeader()

        expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('shows a status icon when shouldShowStatus is true', () => {
        renderHeader({
            shouldShowStatus: true,
            deliveryStatus: { sent_datetime: '2024-03-21T11:00:00Z' },
        })

        expect(screen.getByRole('img', { name: 'check' })).toBeInTheDocument()
    })

    it('does not show status icon when shouldShowStatus is false', () => {
        renderHeader({
            shouldShowStatus: false,
            deliveryStatus: { sent_datetime: '2024-03-21T11:00:00Z' },
        })

        expect(
            screen.queryByRole('img', { name: 'check' }),
        ).not.toBeInTheDocument()
    })
})
