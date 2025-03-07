import React from 'react'

import { render } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    getInboundDisplayStatus,
    VoiceCall,
    VoiceCallDisplayStatus,
    VoiceCallStatus,
} from 'models/voiceCall/types'
import { assumeMock } from 'utils/testing'

import { TicketVoiceCallInboundStatus } from '../TicketVoiceCallInboundStatus'

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({ agentId }: { agentId: number }) => (
            <div>VoiceCallAgentLabel {agentId}</div>
        ),
)

jest.mock('../TicketVoiceCallEvents', () => ({ callId }: any) => (
    <div data-testid="ticket-voice-call-events">{callId}</div>
))

jest.mock('../CollapsibleDetails', () => ({ title, children }: any) => (
    <div data-testid="collapsible-details">
        <div>{title}</div>
        <div>{children}</div>
    </div>
))

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('models/voiceCall/types', () => {
    const originalModule = jest.requireActual('models/voiceCall/types')
    return {
        ...originalModule,
        getInboundDisplayStatus: jest.fn(),
    }
})
const getInboundDisplayStatusMock = assumeMock(getInboundDisplayStatus)

const renderComponent = (voiceCall: VoiceCall) => {
    return render(<TicketVoiceCallInboundStatus voiceCall={voiceCall} />)
}

describe('TicketVoiceCallInboundStatus old', () => {
    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return false
            }
        })
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
        const { getByText } = renderComponent(voiceCall)
        expect(getByText('Ringing')).toBeInTheDocument()
    })

    it('should render "Failed" when voice call status is Failed', () => {
        const voiceCall: VoiceCall = {
            status: VoiceCallStatus.Failed,
            last_answered_by_agent_id: null,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const { getByText } = renderComponent(voiceCall)
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
            const { getByText, getByTestId } = renderComponent(voiceCall)
            expect(getByText('Missed call')).toBeInTheDocument()
            expect(getByTestId('collapsible-details')).toBeInTheDocument()
        },
    )

    it('should render "Answered by" and VoiceCallAgentLabel when voice call status is Answered and last answered by agent is not null', () => {
        const voiceCall: VoiceCall = {
            status: VoiceCallStatus.Answered,
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const { getByText, getByTestId } = renderComponent(voiceCall)
        expect(getByText('Answered by')).toBeInTheDocument()
        expect(getByText('VoiceCallAgentLabel 1')).toBeInTheDocument()
        expect(getByTestId('collapsible-details')).toBeInTheDocument()
    })

    it('should render null when voice call state is invalid', () => {
        const voiceCall: VoiceCall = {
            status: 'some-status' as VoiceCallStatus,
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const { container } = renderComponent(voiceCall)
        expect(container.firstChild).toBeNull()
    })
})

describe('TicketVoiceCallInboundStatus', () => {
    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return true
            }
        })
    })

    it('should render "Ringing"', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Ringing,
        )
        const { getByText } = renderComponent({} as VoiceCall)
        expect(getByText('Ringing')).toBeInTheDocument()
    })

    it.each([
        VoiceCallDisplayStatus.InProgress,
        VoiceCallDisplayStatus.Answered,
    ])(
        'should render "Answered by" and VoiceCallAgentLabel when display status is %s',
        () => {
            getInboundDisplayStatusMock.mockReturnValue(
                VoiceCallDisplayStatus.InProgress,
            )
            const { getByText, getByTestId } = renderComponent({
                last_answered_by_agent_id: 1,
                phone_number_destination: '1234567890',
            } as VoiceCall)
            expect(getByText('Answered by')).toBeInTheDocument()
            expect(getByText('VoiceCallAgentLabel 1')).toBeInTheDocument()
            expect(getByTestId('collapsible-details')).toBeInTheDocument()
        },
    )

    it.each([
        {
            displayStatus: VoiceCallDisplayStatus.Missed,
            colorClass: 'errorStatus',
            textToDisplay: 'Missed call',
        },
        {
            displayStatus: VoiceCallDisplayStatus.Abandoned,
            colorClass: 'errorStatus',
            textToDisplay: 'Abandoned call',
        },
        {
            displayStatus: VoiceCallDisplayStatus.Cancelled,
            colorClass: 'greyStatus',
            textToDisplay: 'Cancelled call',
        },
    ])(
        'should render "$textToDisplay" when display status is $displayStatus',
        ({ displayStatus, colorClass, textToDisplay }) => {
            getInboundDisplayStatusMock.mockReturnValue(displayStatus)
            const { getByText, getByTestId } = renderComponent({
                last_answered_by_agent_id: null,
                phone_number_destination: '1234567890',
            } as VoiceCall)
            expect(getByText(textToDisplay)).toBeInTheDocument()
            expect(getByText('call_missed')).toBeInTheDocument()
            expect(getByTestId('collapsible-details')).toBeInTheDocument()
            expect(
                getByTestId('collapsible-details').querySelector(
                    `.${colorClass}`,
                ),
            ).toBeInTheDocument()
        },
    )

    it('should render null when voice call state is invalid', () => {
        getInboundDisplayStatusMock.mockReturnValue(null)
        const voiceCall: VoiceCall = {
            phone_number_destination: '1234567890',
        } as VoiceCall
        const { container } = renderComponent(voiceCall)
        expect(container.firstChild).toBeNull()
    })
})
