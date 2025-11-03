import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VoiceCallDirection } from '@gorgias/helpdesk-types'

import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getMonitoringParameters } from 'hooks/integrations/phone/monitoring.utils'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { VoiceCall } from 'models/voiceCall/types'
import { isCallBeingMonitored } from 'models/voiceCall/utils'

import MonitorCallButton from './MonitorCallButton'

jest.mock('hooks/integrations/phone/useMonitoringCall')
jest.mock('hooks/integrations/phone/monitoring.utils')
jest.mock('models/voiceCall/utils')

const useMonitoringCallMock = assumeMock(useMonitoringCall)
const getMonitoringParametersMock = assumeMock(getMonitoringParameters)
const isCallBeingMonitoredMock = assumeMock(isCallBeingMonitored)

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

    beforeEach(() => {
        useMonitoringCallMock.mockReturnValue({
            makeMonitoringCall: mockMakeMonitoringCall,
        })
        isCallBeingMonitoredMock.mockReturnValue(false)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render Listening label when call is being monitored', () => {
        isCallBeingMonitoredMock.mockReturnValue(true)

        render(
            <MonitorCallButton voiceCallToMonitor={voiceCall} agentId={42} />,
        )

        expect(
            screen.queryByRole('button', { name: 'Listen' }),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Listening...')).toBeInTheDocument()
        expect(isCallBeingMonitoredMock).toHaveBeenCalledWith(voiceCall, 42)
        expect(getMonitoringParametersMock).not.toHaveBeenCalled()
    })

    it('should render Listen button', () => {
        getMonitoringParametersMock.mockReturnValue(mockParams)

        render(
            <MonitorCallButton
                voiceCallToMonitor={voiceCall}
                agentId={42}
                isMonitorable
            />,
        )

        expect(screen.queryByText('Listening...')).not.toBeInTheDocument()
        const listenButton = screen.getByRole('button', { name: 'Listen' })
        expect(listenButton).toBeInTheDocument()
        expect(listenButton).toBeEnabled()
        expect(isCallBeingMonitoredMock).toHaveBeenCalledWith(voiceCall, 42)
        expect(getMonitoringParametersMock).toHaveBeenCalledWith(voiceCall)
    })

    it('should disable Listen button and show reason when call not monitorable', async () => {
        getMonitoringParametersMock.mockReturnValue(mockParams)

        render(
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

    it.each([
        {
            external_id: 'CA123',
            integration_id: 1,
            customer_id: 100,
            direction: VoiceCallDirection.Inbound,
            phone_number_source: '+1234567890',
            phone_number_destination: '+0987654321',
            last_answered_by_agent_id: 10,
        } as VoiceCall,
        {
            callSid: 'CA123',
            integrationId: 1,
            customerId: 100,
            direction: VoiceCallDirection.Inbound,
            phoneNumberSource: '+1234567890',
            phoneNumberDestination: '+0987654321',
            agentId: 10,
        } as VoiceCallSummary,
    ])(
        'should call makeMonitoringCall with parameters from getMonitoringParameters when button is clicked',
        async (voiceCall) => {
            const user = userEvent.setup()

            getMonitoringParametersMock.mockReturnValue(mockParams)

            render(
                <MonitorCallButton
                    voiceCallToMonitor={voiceCall}
                    agentId={42}
                />,
            )

            await user.click(screen.getByRole('button', { name: 'Listen' }))

            expect(useMonitoringCallMock).toHaveBeenCalledWith(
                voiceCall.direction,
            )
            expect(getMonitoringParametersMock).toHaveBeenCalledWith(voiceCall)
            expect(mockMakeMonitoringCall).toHaveBeenCalledWith(
                mockParams.callSidToMonitor,
                42,
                mockParams.monitoringExtraParams,
            )
        },
    )
})
