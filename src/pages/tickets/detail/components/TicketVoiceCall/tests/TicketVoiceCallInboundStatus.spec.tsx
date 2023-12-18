import React from 'react'
import {render} from '@testing-library/react'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {VoiceCall, VoiceCallStatus} from 'models/voiceCall/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {TicketVoiceCallInboundStatus} from '../TicketVoiceCallInboundStatus'

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({agentId}: {agentId: number}) =>
            <div>VoiceCallAgentLabel {agentId}</div>
)

jest.mock('../CollapsibleDetails', () => () => <div>CollapsibleDetails</div>)

describe('TicketVoiceCallInboundStatus', () => {
    const renderComponent = (voiceCall: VoiceCall) => {
        return render(<TicketVoiceCallInboundStatus voiceCall={voiceCall} />)
    }

    beforeEach(() => {
        mockFlags({[FeatureFlagKey.NewVoiceCallUIEvents]: false})
    })

    afterEach(() => {
        resetLDMocks()
    })

    it.each([
        VoiceCallStatus.Ringing,
        VoiceCallStatus.Initiated,
        VoiceCallStatus.Queued,
        VoiceCallStatus.InProgress,
    ])('should render "Ringing" when voice call status is %s', (status) => {
        const voiceCall: VoiceCall = {
            status,
            last_answered_by_agent_id: null,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {getByText} = renderComponent(voiceCall)
        expect(getByText('Ringing')).toBeInTheDocument()
    })

    it('should render "Failed" when voice call status is Failed', () => {
        const voiceCall: VoiceCall = {
            status: VoiceCallStatus.Failed,
            last_answered_by_agent_id: null,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {getByText} = renderComponent(voiceCall)
        expect(getByText('Failed')).toBeInTheDocument()
    })

    it.each([VoiceCallStatus.Completed, VoiceCallStatus.Ending])(
        'should render "Missed call" when voice call status is %s and last answered by agent is null',
        (status) => {
            const voiceCall: VoiceCall = {
                status,
                last_answered_by_agent_id: null,
                phone_number_destination: '1234567890',
            } as VoiceCall
            const {getByText} = renderComponent(voiceCall)
            expect(getByText('Missed call')).toBeInTheDocument()
        }
    )

    it('should render "Answered by" and VoiceCallAgentLabel when voice call status is Answered and last answered by agent is not null', () => {
        const voiceCall: VoiceCall = {
            status: VoiceCallStatus.Answered,
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {getByText} = renderComponent(voiceCall)
        expect(getByText('Answered by')).toBeInTheDocument()
        expect(getByText('VoiceCallAgentLabel 1')).toBeInTheDocument()
    })

    it('should render null when voice call state is invalid', () => {
        const voiceCall: VoiceCall = {
            status: 'some-status' as VoiceCallStatus,
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {container} = renderComponent(voiceCall)
        expect(container.firstChild).toBeNull()
    })

    it('should render CollapsibleDetails for answered calls when eventsEnabled is true', () => {
        mockFlags({[FeatureFlagKey.NewVoiceCallUIEvents]: true})

        const voiceCall: VoiceCall = {
            status: VoiceCallStatus.Completed,
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {getByText} = renderComponent(voiceCall)
        expect(getByText('CollapsibleDetails')).toBeInTheDocument()
    })

    it('should not render CollapsibleDetails for answered calls when eventsEnabled is false', () => {
        mockFlags({[FeatureFlagKey.NewVoiceCallUIEvents]: false})

        const voiceCall: VoiceCall = {
            status: VoiceCallStatus.Completed,
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {queryByText} = renderComponent(voiceCall)
        expect(queryByText('CollapsibleDetails')).not.toBeInTheDocument()
    })

    it('should render CollapsibleDetails for missed calls when eventsEnabled is true', () => {
        mockFlags({[FeatureFlagKey.NewVoiceCallUIEvents]: true})

        const voiceCall: VoiceCall = {
            status: VoiceCallStatus.Ending,
            last_answered_by_agent_id: null,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {getByText} = renderComponent(voiceCall)
        expect(getByText('CollapsibleDetails')).toBeInTheDocument()
    })

    it('should not render CollapsibleDetails for missed calls when eventsEnabled is false', () => {
        mockFlags({[FeatureFlagKey.NewVoiceCallUIEvents]: false})

        const voiceCall: VoiceCall = {
            status: VoiceCallStatus.Ending,
            last_answered_by_agent_id: null,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const {queryByText} = renderComponent(voiceCall)
        expect(queryByText('CollapsibleDetails')).not.toBeInTheDocument()
    })
})
