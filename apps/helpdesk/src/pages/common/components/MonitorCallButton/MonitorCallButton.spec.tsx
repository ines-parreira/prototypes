import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'

import { mockGetUserHandler } from '@gorgias/helpdesk-mocks'
import { VoiceCallDirection } from '@gorgias/helpdesk-types'

import {
    getMonitoringParameters,
    getMonitoringRestrictionReason,
} from 'hooks/integrations/phone/monitoring.utils'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { useNotify } from 'hooks/useNotify'
import { MONITORING_RESTRICTION_REASONS } from 'models/voiceCall/constants'
import { MonitoringErrorCode, VoiceCall } from 'models/voiceCall/types'
import { getInCallAgentId, isCallBeingMonitored } from 'models/voiceCall/utils'

import MonitorCallButton from './MonitorCallButton'

jest.mock('hooks/integrations/phone/useMonitoringCall')
jest.mock('hooks/integrations/phone/monitoring.utils')
jest.mock('models/voiceCall/utils')
jest.mock('hooks/useNotify')

const useMonitoringCallMock = assumeMock(useMonitoringCall)
const getMonitoringParametersMock = assumeMock(getMonitoringParameters)
const getMonitoringRestrictionReasonMock = assumeMock(
    getMonitoringRestrictionReason,
)
const isCallBeingMonitoredMock = assumeMock(isCallBeingMonitored)
const getInCallAgentIdMock = assumeMock(getInCallAgentId)
const useNotifyMock = assumeMock(useNotify)

const voiceCall = {
    external_id: 'CA123',
    integration_id: 1,
    customer_id: 100,
    direction: VoiceCallDirection.Inbound,
    phone_number_source: '+1234567890',
    phone_number_destination: '+0987654321',
    last_answered_by_agent_id: 10,
} as VoiceCall

const mockParams = {
    callSidToMonitor: 'CA123',
    monitoringExtraParams: {
        integrationId: 1,
        customerId: 100,
        customerPhoneNumber: '+1234567890',
        inCallAgentId: 10,
    },
}

describe('MonitorCallButton', () => {
    const mockMakeMonitoringCall = jest.fn()
    const mockPrepareMonitoringCall = jest
        .fn()
        .mockResolvedValue({ readyForMonitoring: true })
    const mockNotifyError = jest.fn()
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })

    const mockGetUser = mockGetUserHandler()
    const server = setupServer(mockGetUser.handler)

    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                {component}
            </QueryClientProvider>,
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterAll(() => {
        server.close()
    })

    beforeEach(() => {
        useMonitoringCallMock.mockReturnValue({
            makeMonitoringCall: mockMakeMonitoringCall,
            prepareMonitoringCall: mockPrepareMonitoringCall,
        })
        useNotifyMock.mockReturnValue({
            error: mockNotifyError,
        } as any)
        getMonitoringParametersMock.mockReturnValue(mockParams)
        isCallBeingMonitoredMock.mockReturnValue(false)
        getInCallAgentIdMock.mockReturnValue(10)
    })

    afterEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        server.resetHandlers()
    })

    it('should render Listening label when call is being monitored', () => {
        isCallBeingMonitoredMock.mockReturnValue(true)

        renderWithProviders(
            <MonitorCallButton voiceCallToMonitor={voiceCall} agentId={42} />,
        )

        expect(screen.getByText('Listening...')).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Listen' }),
        ).not.toBeInTheDocument()
    })

    it('should render enabled Listen button when monitorable', () => {
        renderWithProviders(
            <MonitorCallButton
                voiceCallToMonitor={voiceCall}
                agentId={42}
                isMonitorable
            />,
        )

        const listenButton = screen.getByRole('button', { name: 'Listen' })
        expect(listenButton).toBeInTheDocument()
        expect(listenButton).toBeEnabled()
    })

    it('should render disabled Listen button with tooltip when not monitorable', async () => {
        renderWithProviders(
            <MonitorCallButton
                voiceCallToMonitor={voiceCall}
                agentId={42}
                isMonitorable={false}
                reason="You cannot monitor this call"
            />,
        )

        const listenButton = screen.getByRole('button', { name: 'Listen' })
        expect(listenButton).toBeDisabled()

        userEvent.hover(listenButton)
        const tooltip = await screen.findByRole('tooltip')
        expect(tooltip).toHaveTextContent('You cannot monitor this call')
    })

    it('should call prepare and start monitoring call when button clicked and there are no issues', async () => {
        const user = userEvent.setup()

        renderWithProviders(
            <MonitorCallButton voiceCallToMonitor={voiceCall} agentId={42} />,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Listen' })),
        )

        expect(mockPrepareMonitoringCall).toHaveBeenCalledWith('CA123')
        expect(mockMakeMonitoringCall).toHaveBeenCalledWith(
            'CA123',
            42,
            mockParams.monitoringExtraParams,
            expect.any(Function),
        )
    })

    it('should call prepare and handle monitoring failure from the backend', async () => {
        const user = userEvent.setup()
        getMonitoringRestrictionReasonMock.mockReturnValue(
            MONITORING_RESTRICTION_REASONS.HANDLING_CALL,
        )

        renderWithProviders(
            <MonitorCallButton voiceCallToMonitor={voiceCall} agentId={42} />,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Listen' })),
        )

        expect(mockPrepareMonitoringCall).toHaveBeenCalledWith('CA123')
        expect(mockMakeMonitoringCall).toHaveBeenCalledWith(
            'CA123',
            42,
            mockParams.monitoringExtraParams,
            expect.any(Function),
        )

        const onMonitoringValidationFailed =
            mockMakeMonitoringCall.mock.calls[0][3]
        onMonitoringValidationFailed(MonitoringErrorCode.HANDLING_CALL)
        expect(mockNotifyError).toHaveBeenCalledWith(
            MONITORING_RESTRICTION_REASONS.HANDLING_CALL,
        )
    })

    it('should notify monitoring error based on error codes', async () => {
        const user = userEvent.setup()
        mockPrepareMonitoringCall.mockResolvedValue({
            readyForMonitoring: false,
            errorType: 'error_code',
            errorCode: MonitoringErrorCode.AGENT_BUSY,
        })
        getMonitoringRestrictionReasonMock.mockReturnValue(
            MONITORING_RESTRICTION_REASONS.AGENT_BUSY,
        )

        renderWithProviders(
            <MonitorCallButton voiceCallToMonitor={voiceCall} agentId={42} />,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Listen' })),
        )

        expect(mockNotifyError).toHaveBeenCalledWith(
            MONITORING_RESTRICTION_REASONS.AGENT_BUSY,
        )
        expect(mockMakeMonitoringCall).not.toHaveBeenCalled()
    })

    describe('switch modal', () => {
        it('should open switch modal when agent is already monitoring another call', async () => {
            const user = userEvent.setup()
            mockPrepareMonitoringCall.mockResolvedValue({
                readyForMonitoring: false,
                errorType: 'error_code',
                errorCode: MonitoringErrorCode.ALREADY_MONITORING_CALL,
            })

            renderWithProviders(
                <MonitorCallButton
                    voiceCallToMonitor={voiceCall}
                    agentId={42}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: 'Listen' })),
            )

            expect(screen.getByText('Switch call?')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'No, continue listening' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Yes, switch call' }),
            ).toBeInTheDocument()

            expect(mockNotifyError).not.toHaveBeenCalled()
            expect(mockMakeMonitoringCall).not.toHaveBeenCalled()
        })

        it('should close switch modal when cancel button clicked', async () => {
            const user = userEvent.setup()
            mockPrepareMonitoringCall.mockResolvedValue({
                readyForMonitoring: false,
                errorType: 'error_code',
                errorCode: MonitoringErrorCode.ALREADY_MONITORING_CALL,
            })

            renderWithProviders(
                <MonitorCallButton
                    voiceCallToMonitor={voiceCall}
                    agentId={42}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: 'Listen' })),
            )

            expect(screen.getByText('Switch call?')).toBeInTheDocument()
            await act(() =>
                user.click(
                    screen.getByRole('button', {
                        name: 'No, continue listening',
                    }),
                ),
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('Switch call?'),
                ).not.toBeInTheDocument()
            })
        })

        it('should switch monitored call when modal confirmed', async () => {
            const user = userEvent.setup()
            mockPrepareMonitoringCall
                .mockResolvedValueOnce({
                    readyForMonitoring: false,
                    errorType: 'error_code',
                    errorCode: MonitoringErrorCode.ALREADY_MONITORING_CALL,
                })
                .mockResolvedValueOnce({ readyForMonitoring: true })

            renderWithProviders(
                <MonitorCallButton
                    voiceCallToMonitor={voiceCall}
                    agentId={42}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: 'Listen' })),
            )

            expect(screen.getByText('Switch call?')).toBeInTheDocument()
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Yes, switch call' }),
                ),
            )

            expect(mockPrepareMonitoringCall).toHaveBeenCalledWith(
                'CA123',
                true,
            )
            expect(mockMakeMonitoringCall).toHaveBeenCalledWith(
                'CA123',
                42,
                mockParams.monitoringExtraParams,
                expect.any(Function),
            )
        })

        it('should switch monitored call when modal confirmed, but handle failure from backend', async () => {
            const user = userEvent.setup()
            mockPrepareMonitoringCall
                .mockResolvedValueOnce({
                    readyForMonitoring: false,
                    errorType: 'error_code',
                    errorCode: MonitoringErrorCode.ALREADY_MONITORING_CALL,
                })
                .mockResolvedValueOnce({ readyForMonitoring: true })
            getMonitoringRestrictionReasonMock.mockReturnValue(
                MONITORING_RESTRICTION_REASONS.HANDLING_CALL,
            )

            renderWithProviders(
                <MonitorCallButton
                    voiceCallToMonitor={voiceCall}
                    agentId={42}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: 'Listen' })),
            )

            expect(screen.getByText('Switch call?')).toBeInTheDocument()
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Yes, switch call' }),
                ),
            )

            expect(mockPrepareMonitoringCall).toHaveBeenCalledWith(
                'CA123',
                true,
            )
            expect(mockMakeMonitoringCall).toHaveBeenCalledWith(
                'CA123',
                42,
                mockParams.monitoringExtraParams,
                expect.any(Function),
            )

            const onMonitoringValidationFailed =
                mockMakeMonitoringCall.mock.calls[0][3]
            onMonitoringValidationFailed(MonitoringErrorCode.HANDLING_CALL)
            expect(mockNotifyError).toHaveBeenCalledWith(
                MONITORING_RESTRICTION_REASONS.HANDLING_CALL,
            )
        })

        it('should notify monitoring error when call switch fails with error code', async () => {
            const user = userEvent.setup()
            mockPrepareMonitoringCall
                .mockResolvedValueOnce({
                    readyForMonitoring: false,
                    errorType: 'error_code',
                    errorCode: MonitoringErrorCode.ALREADY_MONITORING_CALL,
                })
                .mockResolvedValueOnce({
                    readyForMonitoring: false,
                    errorType: 'error_code',
                    errorCode: MonitoringErrorCode.CALL_COMPLETED,
                })
            getMonitoringRestrictionReasonMock.mockReturnValue(
                MONITORING_RESTRICTION_REASONS.CALL_COMPLETED,
            )

            renderWithProviders(
                <MonitorCallButton
                    voiceCallToMonitor={voiceCall}
                    agentId={42}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: 'Listen' })),
            )

            expect(screen.getByText('Switch call?')).toBeInTheDocument()
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Yes, switch call' }),
                ),
            )

            expect(mockNotifyError).toHaveBeenCalledWith(
                MONITORING_RESTRICTION_REASONS.CALL_COMPLETED,
            )
            expect(mockMakeMonitoringCall).not.toHaveBeenCalled()
        })

        it('should notify error message when call switch fails with error message', async () => {
            const user = userEvent.setup()
            mockPrepareMonitoringCall
                .mockResolvedValueOnce({
                    readyForMonitoring: false,
                    errorType: 'error_code',
                    errorCode: MonitoringErrorCode.ALREADY_MONITORING_CALL,
                })
                .mockResolvedValueOnce({
                    readyForMonitoring: false,
                    errorType: 'error_message',
                    errorMessage: 'Something went wrong',
                })

            renderWithProviders(
                <MonitorCallButton
                    voiceCallToMonitor={voiceCall}
                    agentId={42}
                />,
            )

            await act(() =>
                user.click(screen.getByRole('button', { name: 'Listen' })),
            )

            expect(screen.getByText('Switch call?')).toBeInTheDocument()
            await act(() =>
                user.click(
                    screen.getByRole('button', { name: 'Yes, switch call' }),
                ),
            )

            expect(mockNotifyError).toHaveBeenCalledWith('Something went wrong')
            expect(mockMakeMonitoringCall).not.toHaveBeenCalled()
        })
    })
})
