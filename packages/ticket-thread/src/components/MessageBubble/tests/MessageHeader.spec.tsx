import { render, screen } from '@testing-library/react'

import { Avatar } from '@gorgias/axiom'
import type * as Axiom from '@gorgias/axiom'
import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import type { TicketThreadRegularMessageItem } from '../../../hooks/messages/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { MessageHeader } from '../MessageHeader'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = await importOriginal<typeof Axiom>()
    const OriginalAvatar = actual.Avatar
    return {
        ...actual,
        Avatar: vi.fn((props: any) => <OriginalAvatar {...props} />),
    }
})

vi.mock('../../../utils/LegacyBridge', () => ({
    useTicketThreadLegacyBridge: vi.fn(),
}))

const mockAvatar = vi.mocked(Avatar)
const mockUseTicketThreadLegacyBridge = vi.mocked(useTicketThreadLegacyBridge)

const baseItem: TicketThreadRegularMessageItem = {
    _tag: TicketThreadItemTag.Messages.Message,
    data: mockTicketMessage({
        sender: {
            name: 'Jane Doe',
            email: 'jane@example.com',
            id: 1,
            firstname: 'Jane',
            lastname: 'Doe',
            meta: null,
        },
        channel: 'chat',
        created_datetime: '2024-03-21T00:00:00Z',
        failed_datetime: null,
        sent_datetime: null,
        opened_datetime: null,
        from_agent: true,
    }),
    datetime: '2024-03-21T00:00:00Z',
    isPending: false,
}

beforeEach(() => {
    mockUseTicketThreadLegacyBridge.mockReturnValue({
        datetimeFormat: 'YYYY-MM-DD',
        currentTicketShoppingAssistantData: {
            influencedOrders: [],
            shopifyOrders: [],
            shopifyIntegrations: [],
        },
        currentTicketRuleSuggestionData: { shouldDisplayDemoSuggestion: false },
    })
})

function renderHeader(
    item: TicketThreadRegularMessageItem = baseItem,
    shouldShowStatus = false,
) {
    return render(
        <MessageHeader item={item} shouldShowStatus={shouldShowStatus} />,
    )
}

describe('MessageHeader', () => {
    it('renders the sender name', () => {
        renderHeader()

        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })

    it('falls back to sender email when name is not available', () => {
        const item = {
            ...baseItem,
            data: mockTicketMessage({
                ...baseItem.data,
                sender: { ...baseItem.data.sender, name: null },
            }),
        }

        renderHeader(item)

        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })

    it('renders the formatted datetime', () => {
        renderHeader()

        expect(screen.getByText('2024-03-21')).toBeInTheDocument()
    })

    it('passes the sender profile picture url to Avatar', () => {
        const profilePictureUrl = 'https://example.com/avatar.jpg'
        const item = {
            ...baseItem,
            data: mockTicketMessage({
                ...baseItem.data,
                sender: {
                    ...baseItem.data.sender,
                    meta: { profile_picture_url: profilePictureUrl },
                },
            }),
        }

        renderHeader(item)

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
        const item = {
            ...baseItem,
            data: mockTicketMessage({
                ...baseItem.data,
                sent_datetime: '2024-03-21T11:00:00Z',
            }),
        }

        renderHeader(item, true)

        expect(screen.getByRole('img', { name: 'check' })).toBeInTheDocument()
    })

    it('does not show status icon when shouldShowStatus is false', () => {
        const item = {
            ...baseItem,
            data: mockTicketMessage({
                ...baseItem.data,
                sent_datetime: '2024-03-21T11:00:00Z',
            }),
        }

        renderHeader(item, false)

        expect(
            screen.queryByRole('img', { name: 'check' }),
        ).not.toBeInTheDocument()
    })
})
