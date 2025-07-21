import { waitFor } from '@testing-library/react'

import { getVoiceQueue, PhoneRingingBehaviour } from '@gorgias/helpdesk-client'

import {
    getInboundDisplayStatus,
    VoiceCall,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
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

jest.mock('@gorgias/helpdesk-client')
const getVoiceQueueMock = assumeMock(getVoiceQueue)

const renderComponent = (voiceCall: VoiceCall) => {
    return renderWithQueryClientProvider(
        <TicketVoiceCallInboundStatus voiceCall={voiceCall} />,
    )
}
describe('TicketVoiceCallInboundStatus', () => {
    it('should render "Routing"', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Routing,
        )
        const { getByText } = renderComponent({} as VoiceCall)
        expect(getByText('Routing')).toBeInTheDocument()
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

    it('should render "Queued" when display status is "Queued"', () => {
        getInboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Queued,
        )
        const { getByText } = renderComponent({} as VoiceCall)
        expect(getByText('Queued')).toBeInTheDocument()
    })

    describe('Calling', () => {
        it('should render "Calling agents" when display status is "Calling" and distribution mode is "Broadcast"', async () => {
            getVoiceQueueMock.mockResolvedValue({
                data: {
                    distribution_mode: PhoneRingingBehaviour.Broadcast,
                },
            } as any)
            getInboundDisplayStatusMock.mockReturnValue(
                VoiceCallDisplayStatus.Calling,
            )

            const { getByText } = renderComponent({
                queue_id: 1,
            } as VoiceCall)

            await waitFor(() => {
                expect(getVoiceQueueMock).toHaveBeenCalledWith(
                    1,
                    undefined,
                    expect.any(Object),
                )
            })
            await waitFor(() => {
                expect(getByText('Calling agents')).toBeInTheDocument()
            })
        })

        it('should render "Calling <agent> when display status is "Calling" and distribution mode is "Round Robin"', async () => {
            getVoiceQueueMock.mockResolvedValue({
                data: {
                    distribution_mode: PhoneRingingBehaviour.RoundRobin,
                },
            } as any)
            getInboundDisplayStatusMock.mockReturnValue(
                VoiceCallDisplayStatus.Calling,
            )
            const { getByText } = renderComponent({
                queue_id: 1,
                last_rang_agent_id: 3,
                phone_number_destination: '1234567890',
            } as VoiceCall)
            await waitFor(() => {
                expect(getByText('Calling')).toBeInTheDocument()
                expect(getByText('VoiceCallAgentLabel 3')).toBeInTheDocument()
            })
        })
    })

    it.each([
        {
            displayStatus: VoiceCallDisplayStatus.Missed,
            colorClass: 'errorStatus',
            textToDisplay: 'Missed call',
            iconToDisplay: 'call_missed',
        },
        {
            displayStatus: VoiceCallDisplayStatus.Abandoned,
            colorClass: 'errorStatus',
            textToDisplay: 'Abandoned call',
            iconToDisplay: 'call_missed',
        },
        {
            displayStatus: VoiceCallDisplayStatus.Cancelled,
            colorClass: 'greyStatus',
            textToDisplay: 'Cancelled call',
            iconToDisplay: 'call_missed',
        },
        {
            displayStatus: VoiceCallDisplayStatus.CallbackRequested,
            colorClass: 'errorStatus',
            textToDisplay: 'Callback requested',
            iconToDisplay: 'phone_callback',
        },
    ])(
        'should render "$textToDisplay" when display status is $displayStatus',
        ({ displayStatus, colorClass, textToDisplay, iconToDisplay }) => {
            getInboundDisplayStatusMock.mockReturnValue(displayStatus)
            const { getByText, getByTestId } = renderComponent({
                last_answered_by_agent_id: null,
                phone_number_destination: '1234567890',
            } as VoiceCall)
            expect(getByText(textToDisplay)).toBeInTheDocument()
            expect(getByText(iconToDisplay)).toBeInTheDocument()
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
