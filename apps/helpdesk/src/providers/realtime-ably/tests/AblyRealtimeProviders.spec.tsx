import { useFlag } from '@repo/feature-flags'
import { render } from '@testing-library/react'

import AblyRealtimeProviders from '../AblyRealtimeProviders'
import * as isRealtimeEnabledOnCluster from '../utils/isRealtimeEnabledOnCluster'

jest.mock('@gorgias/realtime-ably', () => ({
    RealtimeProvider: ({
        children,
        enableLogging,
    }: {
        children: React.ReactNode
        enableLogging: boolean
    }) => (
        <div>
            <div data-testid="realtime-provider">{children}</div>
            {enableLogging && <div data-testid="enable-logging" />}
        </div>
    ),
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
const mockUseFlag = useFlag as jest.Mock

const isRealtimeEnabledOnClusterSpy = jest.spyOn(
    isRealtimeEnabledOnCluster,
    'isRealtimeEnabledOnCluster',
    'get',
)

describe('AblyRealtimeProviders', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        isRealtimeEnabledOnClusterSpy.mockReturnValue(false)
    })

    afterEach(() => {
        jest.resetModules() // clears module cache
    })

    it('should not render the realtime providers if realtime not enabled on cluster', () => {
        const { queryByTestId } = render(
            <AblyRealtimeProviders>foo</AblyRealtimeProviders>,
        )
        expect(queryByTestId('realtime-provider')).not.toBeInTheDocument()
    })

    it('should render the realtime providers if realtime enabled on cluster', () => {
        isRealtimeEnabledOnClusterSpy.mockReturnValue(true)

        const { getByTestId, getByText } = render(
            <AblyRealtimeProviders>foo</AblyRealtimeProviders>,
        )
        expect(getByTestId('realtime-provider')).toBeInTheDocument()
        expect(getByTestId('agent-activity-provider')).toBeInTheDocument()
        expect(getByTestId('agent-online-status-provider')).toBeInTheDocument()
        expect(getByText('foo')).toBeInTheDocument()
    })

    it('should enable logging if feature flag is enabled', () => {
        isRealtimeEnabledOnClusterSpy.mockReturnValue(true)
        mockUseFlag.mockReturnValue(true)
        const { getByTestId } = render(
            <AblyRealtimeProviders>foo</AblyRealtimeProviders>,
        )
        expect(getByTestId('enable-logging')).toBeInTheDocument()
    })
})
