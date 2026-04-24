import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { render } from '@testing-library/react'

import AblyRealtimeProviders from '../AblyRealtimeProviders'

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

jest.mock('../hooks/useRealtimeConnectionStateChanges', () => ({
    useRealtimeConnectionStateChanges: () => ({
        onRealtimeConnectionStateChange:
            mockHookOnRealtimeConnectionStateChange,
    }),
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
    AgentActivityProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="agent-activity-provider">{children}</div>
    ),
    AgentOnlineStatusProvider: ({
        children,
    }: {
        children: React.ReactNode
    }) => <div data-testid="agent-online-status-provider">{children}</div>,
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
        expect(getByTestId('agent-online-status-provider')).toBeInTheDocument()
        expect(getByText('foo')).toBeInTheDocument()
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

        it('should call reportError when the connection fails and error reporting is enabled', () => {
            mockUseFlag.mockImplementation((flag) => {
                return flag === FeatureFlagKey.AblyErrorReporting
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
                return flag === FeatureFlagKey.AblyErrorReporting
            })

            render(<AblyRealtimeProviders>foo</AblyRealtimeProviders>)

            mockOnConnectionStateChange?.({
                current: 'connected',
                previous: 'connecting',
            })

            expect(mockReportError).not.toHaveBeenCalled()
        })

        it('should not call reportError when error reporting is disabled', () => {
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
