import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { render } from '@testing-library/react'

import AblyRealtimeProviders from '../AblyRealtimeProviders'

let mockLogHandler: ((message: string) => void) | undefined

jest.mock('@gorgias/realtime', () => ({
    RealtimeProvider: ({
        children,
        enableLogging,
        logHandler,
    }: {
        children: React.ReactNode
        enableLogging: boolean
        logHandler?: (message: string) => void
    }) => {
        mockLogHandler = logHandler
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
            mockUseFlag.mockReturnValue(false)

            render(<AblyRealtimeProviders>foo</AblyRealtimeProviders>)

            mockLogHandler?.('Test error message')

            expect(mockReportError).not.toHaveBeenCalled()
        })
    })
})
