import { renderHook } from '@testing-library/react'

import {
    mockTicketCompact,
    mockTicketCompactCustomer,
    mockTicketTranslationCompact,
} from '@gorgias/helpdesk-mocks'
import type { useAgentActivity } from '@gorgias/realtime'
import { useAgentActivity as useAgentActivityMock } from '@gorgias/realtime'

import { useTicketListItemData } from '../useTicketListItemData'

vi.mock('@gorgias/realtime', () => ({
    useAgentActivity: vi.fn(),
}))

type AgentActivity = ReturnType<typeof useAgentActivity>

function makeAgentActivity(
    overrides: Partial<AgentActivity> = {},
): AgentActivity {
    return {
        viewTickets: vi.fn(),
        joinTicket: vi.fn(),
        leaveTicket: vi.fn(),
        getTicketActivity: vi.fn().mockReturnValue({ viewing: [], typing: [] }),
        startTyping: vi.fn().mockResolvedValue(undefined),
        stopTyping: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    }
}

const mockGetTicketActivity = vi.fn().mockReturnValue({ viewing: [] })

beforeEach(() => {
    vi.mocked(useAgentActivityMock).mockReturnValue(
        makeAgentActivity({ getTicketActivity: mockGetTicketActivity }),
    )
    mockGetTicketActivity.mockReturnValue({ viewing: [] })
})

afterEach(() => {
    vi.clearAllMocks()
})

describe('useTicketListItemData', () => {
    describe('otherAgentsViewing', () => {
        const alice = { id: 1, name: 'Alice', email: 'alice@example.com' }
        const bob = { id: 2, name: 'Bob', email: 'bob@example.com' }

        it('calls getTicketActivity with the ticket id when ticket.id is set', () => {
            const { result } = renderHook(() =>
                useTicketListItemData({
                    ticket: mockTicketCompact({ id: 42 }),
                }),
            )
            expect(mockGetTicketActivity).toHaveBeenCalledWith(42)
            expect(result.current.otherAgentsViewing).toEqual([])
        })

        it('does not call getTicketActivity and returns empty viewing list when ticket.id is falsy', () => {
            const { result } = renderHook(() =>
                useTicketListItemData({
                    ticket: mockTicketCompact({ id: 0 }),
                }),
            )
            expect(mockGetTicketActivity).not.toHaveBeenCalled()
            expect(result.current.otherAgentsViewing).toEqual([])
        })

        it.each([
            ['returns empty array when no agents are viewing', [], 1, []],
            [
                'excludes the current user from the viewing list',
                [alice, bob],
                1,
                [bob],
            ],
            [
                'returns all agents when currentUserId is not provided',
                [alice, bob],
                undefined,
                [alice, bob],
            ],
        ])('%s', (_, viewing, currentUserId, expected) => {
            mockGetTicketActivity.mockReturnValue({ viewing })
            const { result } = renderHook(() =>
                useTicketListItemData({
                    ticket: mockTicketCompact(),
                    currentUserId,
                }),
            )
            expect(result.current.otherAgentsViewing).toEqual(expected)
        })
    })

    describe('customerName', () => {
        it.each([
            [
                'returns name when available',
                mockTicketCompactCustomer({
                    name: 'Alice Smith',
                    email: 'alice@example.com',
                }),
                'Alice Smith',
            ],
            [
                'falls back to email when name is not set',
                mockTicketCompactCustomer({
                    name: '',
                    email: 'alice@example.com',
                }),
                'alice@example.com',
            ],
            [
                'falls back to "Customer #id" when name and email are not set',
                mockTicketCompactCustomer({ id: 10, name: '', email: '' }),
                'Customer #10',
            ],
            ['returns empty string when there is no customer', undefined, ''],
        ])('%s', (_, customer, expected) => {
            const { result } = renderHook(() =>
                useTicketListItemData({
                    ticket: mockTicketCompact({ customer }),
                }),
            )
            expect(result.current.customerName).toBe(expected)
        })
    })

    describe('displaySubject', () => {
        it.each([
            [
                'returns ticket.subject by default',
                false,
                undefined,
                'Help with order',
            ],
            [
                'returns translated subject when showTranslatedContent is true and translation exists',
                true,
                mockTicketTranslationCompact({
                    subject: 'Aide avec la commande',
                }),
                'Aide avec la commande',
            ],
            [
                'returns ticket.subject when showTranslatedContent is false',
                false,
                mockTicketTranslationCompact({
                    subject: 'Aide avec la commande',
                }),
                'Help with order',
            ],
            [
                'returns ticket.subject when showTranslatedContent is true but no translation',
                true,
                undefined,
                'Help with order',
            ],
        ])('%s', (_, showTranslatedContent, translation, expected) => {
            const { result } = renderHook(() =>
                useTicketListItemData({
                    ticket: mockTicketCompact({ subject: 'Help with order' }),
                    showTranslatedContent,
                    translation,
                }),
            )
            expect(result.current.displaySubject).toBe(expected)
        })
    })

    describe('displayExcerpt', () => {
        it.each([
            [
                'returns ticket.excerpt by default',
                'I need help with my order',
                false,
                undefined,
                'I need help with my order',
            ],
            [
                'returns empty string when ticket has no excerpt',
                null,
                false,
                undefined,
                '',
            ],
            [
                'returns translated excerpt when showTranslatedContent is true and translation exists',
                'I need help with my order',
                true,
                mockTicketTranslationCompact({
                    excerpt: 'Besoin aide avec commande',
                }),
                'Besoin aide avec commande',
            ],
            [
                'returns ticket.excerpt when showTranslatedContent is false',
                'I need help with my order',
                false,
                mockTicketTranslationCompact({
                    excerpt: 'Besoin aide avec commande',
                }),
                'I need help with my order',
            ],
        ])('%s', (_, excerpt, showTranslatedContent, translation, expected) => {
            const { result } = renderHook(() =>
                useTicketListItemData({
                    ticket: mockTicketCompact({ excerpt }),
                    showTranslatedContent,
                    translation,
                }),
            )
            expect(result.current.displayExcerpt).toBe(expected)
        })
    })
})
