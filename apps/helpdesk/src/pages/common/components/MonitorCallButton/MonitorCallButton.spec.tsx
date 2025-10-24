import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VoiceCallDirection } from '@gorgias/helpdesk-types'

import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getMonitoringParameters } from 'hooks/integrations/phone/monitoring.utils'
import { useMonitoringCall } from 'hooks/integrations/phone/useMonitoringCall'
import { VoiceCall } from 'models/voiceCall/types'

import MonitorCallButton from './MonitorCallButton'

jest.mock('hooks/integrations/phone/useMonitoringCall')
jest.mock('hooks/integrations/phone/monitoring.utils')

const useMonitoringCallMock = assumeMock(useMonitoringCall)
const getMonitoringParametersMock = assumeMock(getMonitoringParameters)

describe('MonitorCallButton', () => {
    const mockMakeMonitoringCall = jest.fn()

    beforeEach(() => {
        useMonitoringCallMock.mockReturnValue({
            makeMonitoringCall: mockMakeMonitoringCall,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render Listen button', () => {
        const voiceCall: VoiceCall = {
            external_id: 'CA123',
            integration_id: 1,
            customer_id: 100,
            direction: VoiceCallDirection.Inbound,
            phone_number_source: '+1234567890',
            phone_number_destination: '+0987654321',
            last_answered_by_agent_id: 10,
        } as VoiceCall

        getMonitoringParametersMock.mockReturnValue({
            callSidToMonitor: 'CA123',
            monitoringExtraParams: {
                integrationId: 1,
                customerId: 100,
                customerPhoneNumber: '+1234567890',
                inCallAgentId: 10,
            },
        })

        render(<MonitorCallButton voiceCallToMonitor={voiceCall} agentId={5} />)

        expect(screen.getByText('Listen')).toBeInTheDocument()
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

            const mockParams = {
                callSidToMonitor: 'CA123',
                monitoringExtraParams: {
                    integrationId: 1,
                    customerId: 100,
                    customerPhoneNumber: '+1234567890',
                    inCallAgentId: 10,
                },
            }

            getMonitoringParametersMock.mockReturnValue(mockParams)

            render(
                <MonitorCallButton
                    voiceCallToMonitor={voiceCall}
                    agentId={5}
                />,
            )

            await user.click(screen.getByText('Listen'))

            expect(getMonitoringParametersMock).toHaveBeenCalledWith(voiceCall)
            expect(mockMakeMonitoringCall).toHaveBeenCalledWith(
                mockParams.callSidToMonitor,
                5,
                mockParams.monitoringExtraParams,
            )
        },
    )
})
