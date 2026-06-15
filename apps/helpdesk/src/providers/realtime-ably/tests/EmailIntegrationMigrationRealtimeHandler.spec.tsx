import { render } from '@repo/testing'

import { useChannel } from '@gorgias/realtime'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUserId } from 'state/currentUser/selectors'
import {
    onVerifyMigrationForwarding,
    onVerifyMigrationForwardingFailure,
} from 'state/integrations/actions'
import { getEmailMigrations } from 'state/integrations/selectors'

import { EmailIntegrationMigrationRealtimeHandler } from '../EmailIntegrationMigrationRealtimeHandler'

jest.mock('@gorgias/realtime')
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('state/integrations/actions', () => ({
    onVerifyMigrationForwarding: jest.fn(),
    onVerifyMigrationForwardingFailure: jest.fn(),
}))

const mockUseChannel = useChannel as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockOnVerifyMigrationForwarding = onVerifyMigrationForwarding as jest.Mock
const mockOnVerifyMigrationForwardingFailure =
    onVerifyMigrationForwardingFailure as jest.Mock

const dispatch = jest.fn()
const migration = {
    integration: {
        id: 1,
        meta: {
            address: 'address@gorgias.com',
        },
    },
}

describe('EmailIntegrationMigrationRealtimeHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(dispatch)
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return 123
            if (selector === getCurrentUserId) return 456
            if (selector === getEmailMigrations) return [migration]

            return undefined
        })
    })

    it('subscribes to the current user channel', () => {
        render(<EmailIntegrationMigrationRealtimeHandler />)

        expect(mockUseChannel).toHaveBeenCalledWith({
            channel: {
                name: 'user',
                accountId: 123,
                userId: 456,
            },
            onMessage: expect.any(Function),
        })
    })

    it('dispatches migration success behavior when the verified Ably event is received', () => {
        render(<EmailIntegrationMigrationRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: 'email.integration-migration-verified',
            data: JSON.stringify({
                integration_id: 1,
            }),
        })

        expect(mockOnVerifyMigrationForwarding).toHaveBeenCalledWith(
            dispatch,
            migration.integration.id,
            migration.integration.meta.address,
        )
    })

    it('dispatches migration failure behavior when the failed Ably event is received', () => {
        render(<EmailIntegrationMigrationRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: 'email.integration-migration-failed',
            data: JSON.stringify({
                integration_id: 1,
            }),
        })

        expect(mockOnVerifyMigrationForwardingFailure).toHaveBeenCalledWith(
            dispatch,
            migration.integration.id,
            migration.integration.meta.address,
        )
    })

    it('ignores unrelated events', () => {
        render(<EmailIntegrationMigrationRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: 'email.integration-verified',
            data: JSON.stringify({
                integration_id: 1,
            }),
        })

        expect(mockOnVerifyMigrationForwarding).not.toHaveBeenCalled()
        expect(mockOnVerifyMigrationForwardingFailure).not.toHaveBeenCalled()
    })

    it('does not subscribe when accountId is not yet available', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return undefined
            if (selector === getCurrentUserId) return 456
            if (selector === getEmailMigrations) return [migration]

            return undefined
        })

        render(<EmailIntegrationMigrationRealtimeHandler />)

        expect(mockUseChannel).toHaveBeenCalledWith({
            channel: undefined,
            onMessage: expect.any(Function),
        })
    })

    it('does not subscribe when userId is not yet available', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return 123
            if (selector === getCurrentUserId) return undefined
            if (selector === getEmailMigrations) return [migration]

            return undefined
        })

        render(<EmailIntegrationMigrationRealtimeHandler />)

        expect(mockUseChannel).toHaveBeenCalledWith({
            channel: undefined,
            onMessage: expect.any(Function),
        })
    })

    it('ignores migration events without a matching migration', () => {
        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return 123
            if (selector === getCurrentUserId) return 456
            if (selector === getEmailMigrations) return []

            return undefined
        })

        render(<EmailIntegrationMigrationRealtimeHandler />)

        const [{ onMessage }] = mockUseChannel.mock.calls[0]

        onMessage({
            name: 'email.integration-migration-verified',
            data: JSON.stringify({
                integration_id: 1,
            }),
        })

        expect(mockOnVerifyMigrationForwarding).not.toHaveBeenCalled()
        expect(mockOnVerifyMigrationForwardingFailure).not.toHaveBeenCalled()
    })
})
