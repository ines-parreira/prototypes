import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'

import { useChannel } from '@gorgias/realtime'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'

import { UserChannelRealtimeHandler } from '../UserChannelRealtimeHandler'
import { useTicketMessageActionFailedRealtimeMessageHandler } from '../useTicketMessageActionFailedRealtimeMessageHandler'

jest.mock('@gorgias/realtime')
jest.mock('@repo/feature-flags')
jest.mock('hooks/useAppSelector')
jest.mock('../useTicketMessageActionFailedRealtimeMessageHandler', () => ({
    TICKET_MESSAGE_ACTION_FAILED_EVENT: 'ticket-message-action.failed',
    useTicketMessageActionFailedRealtimeMessageHandler: jest.fn(),
}))

const mockUseChannel = useChannel as jest.Mock
const mockUseFlag = useFlag as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseTicketMessageActionFailedRealtimeMessageHandler =
    useTicketMessageActionFailedRealtimeMessageHandler as jest.Mock
const mockHandleTicketMessageActionFailedRealtimeMessage = jest.fn()

function enableFlags(enabledFlags: FeatureFlagKey[]) {
    mockUseFlag.mockImplementation((flag) => enabledFlags.includes(flag))
}

describe('UserChannelRealtimeHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseTicketMessageActionFailedRealtimeMessageHandler.mockReturnValue({
            handleTicketMessageActionFailedRealtimeMessage:
                mockHandleTicketMessageActionFailedRealtimeMessage,
        })
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return 123
            if (selector === getCurrentUserId) return 456

            return undefined
        })
        enableFlags([])
    })

    it('subscribes to the current user channel', () => {
        render(<UserChannelRealtimeHandler />)

        expect(mockUseChannel).toHaveBeenCalledWith({
            channel: {
                name: 'user',
                accountId: 123,
                userId: 456,
            },
            onMessage: expect.any(Function),
        })
    })

    it('handles ticket message action failed messages when the feature flag is enabled', () => {
        enableFlags([FeatureFlagKey.TicketMessageActionFailedToAbly])
        render(<UserChannelRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]
        const message = {
            name: 'ticket-message-action.failed',
            data: {
                ticket_id: 42,
            },
        }

        onMessage(message)

        expect(
            mockHandleTicketMessageActionFailedRealtimeMessage,
        ).toHaveBeenCalledWith(message)
    })

    it('ignores ticket message action failed messages when the feature flag is disabled', () => {
        render(<UserChannelRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: 'ticket-message-action.failed',
            data: {
                ticket_id: 42,
            },
        })

        expect(
            mockHandleTicketMessageActionFailedRealtimeMessage,
        ).not.toHaveBeenCalled()
    })

    it('ignores unrelated messages', () => {
        enableFlags([FeatureFlagKey.TicketMessageActionFailedToAbly])
        render(<UserChannelRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: 'ticket-message-action.completed',
            data: {
                ticket_id: 42,
            },
        })

        expect(
            mockHandleTicketMessageActionFailedRealtimeMessage,
        ).not.toHaveBeenCalled()
    })
})
