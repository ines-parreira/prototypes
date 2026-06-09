import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { render } from '@repo/testing'

import AblyRealtimeProviders from '../AblyRealtimeProviders'
import { useRealtimeAccountPresenceSubscription } from '../hooks/useRealtimeAccountPresenceSubscription'

let mockLogHandler: ((message: string) => void) | undefined
let mockOnConnectionStateChange:
    | ((stateChange: {
          current: string
          previous?: string
          reason?: {
              message?: string
              code?: number
              statusCode?: number
          }
      }) => void)
    | undefined

const mockHookOnRealtimeConnectionStateChange = jest.fn()
const mockUseRealtimeAccountPresenceSubscription =
    useRealtimeAccountPresenceSubscription as jest.Mock

jest.mock('../hooks/useRealtimeAccountPresenceSubscription', () => ({
    useRealtimeAccountPresenceSubscription: jest.fn(),
}))

jest.mock('../hooks/useRealtimeConnectionStateChanges', () => ({
    useRealtimeConnectionStateChanges: () => ({
        onRealtimeConnectionStateChange:
            mockHookOnRealtimeConnectionStateChange,
    }),
}))

jest.mock('../UserChannelRealtimeHandler', () => ({
    UserChannelRealtimeHandler: () => (
        <div data-testid="user-channel-realtime-handler" />
    ),
}))

jest.mock('../EmailIntegrationMigrationRealtimeHandler', () => ({
    EmailIntegrationMigrationRealtimeHandler: () => (
        <div data-testid="email-migration-realtime-handler" />
    ),
}))

jest.mock('@gorgias/realtime', () => ({
    RealtimeProvider: ({
        children,
        enableLogging,
        logHandler,
        onConnectionStateChange,
    }: {
        children: React.ReactNode
        enableLogging: boolean
        logHandler?: (message: string) => void
        onConnectionStateChange?: (stateChange: {
            current: string
            previous?: string
            reason?: {
                message?: string
                code?: number
                statusCode?: number
            }
        }) => void
    }) => {
        mockLogHandler = logHandler
        mockOnConnectionStateChange = onConnectionStateChange
        return (
            <div>
                <div data-testid="realtime-provider">{children}</div>
                {enableLogging && <div data-testid="enable-logging" />}
            </div>
        )
    },
    AgentActivityProvider: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="agent-activity-provider">{children}</div>
    ),
}))

jest.mock('@repo/feature-flags')
jest.mock('@repo/logging')

const mockUseFlag = useFlag as jest.Mock
const mockReportError = reportError as jest.MockedFunction<typeof reportError>

describe('AblyRealtimeProviders', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockLogHandler = undefined
        mockOnConnectionStateChange = undefined
        mockHookOnRealtimeConnectionStateChange.mockClear()
        mockUseRealtimeAccountPresenceSubscription.mockClear()
        mockReportError.mockClear()
    })

    afterEach(() => {
        jest.resetModules() // clears module cache
    })

    it('should render the realtime providers ', () => {
        const { getByTestId, getByText } = render(
            <AblyRealtimeProviders>foo</AblyRealtimeProviders>,
        )

        expect(getByTestId('realtime-provider')).toBeInTheDocument()
        expect(getByTestId('agent-activity-provider')).toBeInTheDocument()
        expect(getByText('foo')).toBeInTheDocument()
        expect(mockUseRealtimeAccountPresenceSubscription).toHaveBeenCalled()
    })

    it('should render the user channel realtime handler', () => {
        const { getByTestId } = render(
            <AblyRealtimeProviders>foo</AblyRealtimeProviders>,
        )

        expect(getByTestId('user-channel-realtime-handler')).toBeInTheDocument()
    })

    it('should render the email migration realtime handler when the migration feature flag is enabled', () => {
        mockUseFlag.mockImplementation((flag) => {
            return flag === FeatureFlagKey.EmailIntegrationMigrationToAbly
        })

        const { getByTestId } = render(
            <AblyRealtimeProviders>foo</AblyRealtimeProviders>,
        )

        expect(
            getByTestId('email-migration-realtime-handler'),
        ).toBeInTheDocument()
    })

    it('should not render the email migration realtime handler when the migration feature flag is disabled', () => {
        const { queryByTestId } = render(
            <AblyRealtimeProviders>foo</AblyRealtimeProviders>,
        )

        expect(
            queryByTestId('email-migration-realtime-handler'),
        ).not.toBeInTheDocument()
    })

    it('should enable logging if feature flag is enabled', () => {
        mockUseFlag.mockImplementation((flag) => {
            return flag === FeatureFlagKey.AblyRealtimeLogging
        })

        const { getByTestId } = render(
            <AblyRealtimeProviders>foo</AblyRealtimeProviders>,
        )

        expect(getByTestId('enable-logging')).toBeInTheDocument()
    })

    describe('logHandler', () => {
        it('should call reportError when error reporting is enabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                return flag === FeatureFlagKey.AblyErrorReporting
            })

            render(<AblyRealtimeProviders>foo</AblyRealtimeProviders>)

            mockLogHandler?.('Test error message')

            expect(mockReportError).toHaveBeenCalledWith(
                new Error('AblySDKError'),
                {
                    tags: {
                        message: 'Test error message',
                    },
                },
            )
        })

        it('should not call reportError when error reporting is disabled', () => {
            render(<AblyRealtimeProviders>foo</AblyRealtimeProviders>)

            mockLogHandler?.('Test error message')

            expect(mockReportError).not.toHaveBeenCalled()
        })
    })

    describe('onConnectionStateChange', () => {
        it('should delegate state changes to the realtime connection hook', () => {
            render(<AblyRealtimeProviders>foo</AblyRealtimeProviders>)

            mockOnConnectionStateChange?.({
                current: 'connected',
                previous: 'connecting',
            })

            expect(
                mockHookOnRealtimeConnectionStateChange,
            ).toHaveBeenCalledWith({
                current: 'connected',
                previous: 'connecting',
            })
        })

        it('should call reportError when the connection fails and failed state reporting is enabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                return flag === FeatureFlagKey.AblyFailedStateReporting
            })

            render(<AblyRealtimeProviders>foo</AblyRealtimeProviders>)

            mockOnConnectionStateChange?.({
                current: 'failed',
                previous: 'connecting',
                reason: {
                    message: 'Test connection failure',
                    code: 80003,
                    statusCode: 500,
                },
            })

            expect(mockReportError).toHaveBeenCalledWith(
                new Error('RealtimeFailedConnectionState'),
                {
                    tags: {
                        current: 'failed',
                        previous: 'connecting',
                        message: 'Test connection failure',
                        code: 80003,
                        statusCode: 500,
                    },
                },
            )
        })

        it('should not call reportError when the connection does not fail', () => {
            mockUseFlag.mockImplementation((flag) => {
                return flag === FeatureFlagKey.AblyFailedStateReporting
            })

            render(<AblyRealtimeProviders>foo</AblyRealtimeProviders>)

            mockOnConnectionStateChange?.({
                current: 'connected',
                previous: 'connecting',
            })

            expect(mockReportError).not.toHaveBeenCalled()
        })

        it('should not call reportError when failed state reporting is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            render(<AblyRealtimeProviders>foo</AblyRealtimeProviders>)

            mockOnConnectionStateChange?.({
                current: 'failed',
                previous: 'connecting',
                reason: {
                    message: 'Test connection failure',
                    code: 80003,
                    statusCode: 500,
                },
            })

            expect(mockReportError).not.toHaveBeenCalled()
        })
    })
})
