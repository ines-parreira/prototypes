import { render } from '@repo/testing'

import { useChannel } from '@gorgias/realtime'

import { section } from 'fixtures/section'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { syncTicketNavViewSourceSdkEvent } from 'main/init/socketEvents/ticketNavViewSourceSdkSocketSync'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
} from 'state/entities/sections/actions'

import {
    VIEW_SECTION_CREATED_EVENT,
    VIEW_SECTION_DELETED_EVENT,
    VIEW_SECTION_UPDATED_EVENT,
    ViewSectionsRealtimeHandler,
} from '../ViewSectionsRealtimeHandler'

jest.mock('@gorgias/realtime')
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('main/init/socketEvents/ticketNavViewSourceSdkSocketSync', () => ({
    syncTicketNavViewSourceSdkEvent: jest.fn(),
}))

const mockUseChannel = useChannel as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockSyncTicketNavViewSourceSdkEvent =
    syncTicketNavViewSourceSdkEvent as jest.Mock

const dispatch = jest.fn()
const viewSectionPayload = {
    id: section.id,
    created_datetime: section.created_datetime,
    decoration: section.decoration,
    name: section.name,
    private: section.private,
    updated_datetime: section.updated_datetime,
    uri: section.uri,
}
const privateViewSectionPayload = {
    ...viewSectionPayload,
    private: true,
}

function mockCurrentIds(
    {
        accountId,
        userId,
    }: {
        accountId?: number
        userId?: number
    } = { accountId: 123, userId: 456 },
) {
    mockUseAppSelector.mockImplementation((selector) => {
        if (selector === getCurrentAccountId) return accountId
        if (selector === getCurrentUserId) return userId

        return undefined
    })
}

describe('ViewSectionsRealtimeHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(dispatch)
        mockCurrentIds()
    })

    it('subscribes to account and current user channels', () => {
        render(<ViewSectionsRealtimeHandler />)

        expect(mockUseChannel).toHaveBeenNthCalledWith(1, {
            channel: {
                name: 'account',
                accountId: 123,
            },
            onMessage: expect.any(Function),
        })
        expect(mockUseChannel).toHaveBeenNthCalledWith(2, {
            channel: {
                name: 'user',
                accountId: 123,
                userId: 456,
            },
            onMessage: expect.any(Function),
        })
    })

    it('skips subscriptions when account and user ids are unavailable', () => {
        mockCurrentIds({
            accountId: undefined,
            userId: undefined,
        })

        render(<ViewSectionsRealtimeHandler />)

        expect(mockUseChannel).toHaveBeenNthCalledWith(1, {
            channel: undefined,
            onMessage: expect.any(Function),
        })
        expect(mockUseChannel).toHaveBeenNthCalledWith(2, {
            channel: undefined,
            onMessage: expect.any(Function),
        })
    })

    it('dispatches section created behavior for a valid object payload', () => {
        render(<ViewSectionsRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: VIEW_SECTION_CREATED_EVENT,
            data: viewSectionPayload,
        })

        expect(dispatch).toHaveBeenCalledWith(
            sectionCreated(viewSectionPayload),
        )
        expect(mockSyncTicketNavViewSourceSdkEvent).toHaveBeenCalledWith({
            type: 'view-section-created',
            section: viewSectionPayload,
        })
    })

    it('parses a valid string payload', () => {
        render(<ViewSectionsRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: VIEW_SECTION_CREATED_EVENT,
            data: JSON.stringify(viewSectionPayload),
        })

        expect(dispatch).toHaveBeenCalledWith(
            sectionCreated(viewSectionPayload),
        )
        expect(mockSyncTicketNavViewSourceSdkEvent).toHaveBeenCalledWith({
            type: 'view-section-created',
            section: viewSectionPayload,
        })
    })

    it('dispatches private sections from the current user channel', () => {
        render(<ViewSectionsRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[1]

        onMessage({
            name: VIEW_SECTION_CREATED_EVENT,
            data: privateViewSectionPayload,
        })

        expect(dispatch).toHaveBeenCalledWith(
            sectionCreated(privateViewSectionPayload),
        )
        expect(mockSyncTicketNavViewSourceSdkEvent).toHaveBeenCalledWith({
            type: 'view-section-created',
            section: privateViewSectionPayload,
        })
    })

    it('dispatches section updated behavior for a valid payload', () => {
        render(<ViewSectionsRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: VIEW_SECTION_UPDATED_EVENT,
            data: viewSectionPayload,
        })

        expect(dispatch).toHaveBeenCalledWith(
            sectionUpdated(viewSectionPayload),
        )
        expect(mockSyncTicketNavViewSourceSdkEvent).toHaveBeenCalledWith({
            type: 'view-section-updated',
            section: viewSectionPayload,
        })
    })

    it('dispatches section deleted behavior for a valid payload', () => {
        render(<ViewSectionsRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: VIEW_SECTION_DELETED_EVENT,
            data: viewSectionPayload,
        })

        expect(dispatch).toHaveBeenCalledWith(sectionDeleted(section.id))
        expect(mockSyncTicketNavViewSourceSdkEvent).toHaveBeenCalledWith({
            type: 'view-section-deleted',
            sectionId: viewSectionPayload.id,
        })
    })

    it('ignores sections sent to the wrong channel', () => {
        render(<ViewSectionsRealtimeHandler />)

        const [{ onMessage: onAccountMessage }] = mockUseChannel.mock.calls[0]
        const [{ onMessage: onUserMessage }] = mockUseChannel.mock.calls[1]

        onAccountMessage({
            name: VIEW_SECTION_CREATED_EVENT,
            data: privateViewSectionPayload,
        })
        onUserMessage({
            name: VIEW_SECTION_CREATED_EVENT,
            data: viewSectionPayload,
        })

        expect(dispatch).not.toHaveBeenCalled()
        expect(mockSyncTicketNavViewSourceSdkEvent).not.toHaveBeenCalled()
    })

    it('ignores unrelated events', () => {
        render(<ViewSectionsRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: 'views-count.updated',
            data: viewSectionPayload,
        })

        expect(dispatch).not.toHaveBeenCalled()
        expect(mockSyncTicketNavViewSourceSdkEvent).not.toHaveBeenCalled()
    })

    it('ignores malformed payloads', () => {
        render(<ViewSectionsRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: VIEW_SECTION_CREATED_EVENT,
            data: {
                ...viewSectionPayload,
                id: '1',
            },
        })

        expect(dispatch).not.toHaveBeenCalled()
        expect(mockSyncTicketNavViewSourceSdkEvent).not.toHaveBeenCalled()
    })
})
