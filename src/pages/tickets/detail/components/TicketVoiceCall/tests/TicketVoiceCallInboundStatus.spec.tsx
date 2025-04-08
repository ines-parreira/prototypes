import { render } from '@testing-library/react'

import {
    getInboundDisplayStatus,
    VoiceCall,
    VoiceCallDisplayStatus,
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
describe('TicketVoiceCallInboundStatus', () => {
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
