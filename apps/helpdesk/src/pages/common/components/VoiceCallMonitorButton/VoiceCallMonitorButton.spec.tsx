import { assumeMock, render } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockGetUserHandler,
} from '@gorgias/helpdesk-mocks'
import type { VoiceCall } from '@gorgias/helpdesk-queries'

import { ThemeProvider } from 'core/theme'
import {
    getCallMonitorability,
    getMonitoringParameters,
    getMonitoringRestrictionReason,
} from 'hooks/integrations/phone/monitoring.utils'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { getInCallAgentId, isCallBeingMonitored } from 'models/voiceCall/utils'

import { VoiceCallMonitorButton } from './VoiceCallMonitorButton'

jest.mock('hooks/integrations/phone/useMonitoringCall')
jest.mock('hooks/integrations/phone/monitoring.utils', () => ({
    ...jest.requireActual('hooks/integrations/phone/monitoring.utils'),
    getCallMonitorability: jest.fn(),
    getMonitoringParameters: jest.fn(),
    getMonitoringRestrictionReason: jest.fn(),
}))
jest.mock('models/voiceCall/utils', () => ({
    getInCallAgentId: jest.fn(),
    isCallBeingMonitored: jest.fn(),
}))

const mockGetCurrentUser = mockGetCurrentUserHandler()
const mockGetUser = mockGetUserHandler()

const server = setupServer(mockGetCurrentUser.handler, mockGetUser.handler)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const voiceCall = {
    external_id: 'CA123',
    integration_id: 1,
    customer_id: 100,
    direction: 'inbound',
    phone_number_source: '+1234567890',
    phone_number_destination: '+0987654321',
    last_answered_by_agent_id: 10,
} as VoiceCall

function makeQueryClient() {
    return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderComponent(queryClient = makeQueryClient()) {
    return render(
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <VoiceCallMonitorButton voiceCall={voiceCall} />
            </ThemeProvider>
        </QueryClientProvider>,
    )
}

beforeEach(() => {
    assumeMock(useMonitoringCall).mockReturnValue({
        prepareMonitoringCall: jest.fn(),
        makeMonitoringCall: jest.fn(),
    })
    assumeMock(getCallMonitorability).mockReturnValue({ isMonitorable: true })
    assumeMock(getInCallAgentId).mockReturnValue(10)
    assumeMock(isCallBeingMonitored).mockReturnValue(false)
    assumeMock(getMonitoringParameters).mockReturnValue({
        callSidToMonitor: 'CA123',
        monitoringExtraParams: {} as any,
    })
    assumeMock(getMonitoringRestrictionReason).mockReturnValue('')
})

describe('VoiceCallMonitorButton', () => {
    it('renders the Listen button when the current user is an admin', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /listen/i }),
            ).toBeInTheDocument()
        })
    })

    it('renders nothing when the user does not have Admin or Agent role', async () => {
        server.use(
            mockGetCurrentUserHandler(async () =>
                HttpResponse.json({
                    id: 1,
                    role: { name: 'viewer' },
                }),
            ).handler,
        )

        renderComponent()

        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: /listen/i }),
            ).not.toBeInTheDocument()
        })
    })

    it('renders the Listen button when there is no in-call agent', async () => {
        assumeMock(getInCallAgentId).mockReturnValue(null)

        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /listen/i }),
            ).toBeInTheDocument()
        })
    })
})
