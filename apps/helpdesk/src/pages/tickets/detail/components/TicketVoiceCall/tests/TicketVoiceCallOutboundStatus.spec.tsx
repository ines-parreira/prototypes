import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import type { VoiceCall } from 'models/voiceCall/types'
import {
    getOutboundDisplayStatus,
    VoiceCallDisplayStatus,
} from 'models/voiceCall/types'

import TicketVoiceCallOutboundStatus from '../TicketVoiceCallOutboundStatus'

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({
            customerId,
            phoneNumber,
            interactable,
        }: {
            customerId: string
            phoneNumber: string
            interactable?: boolean
        }) => (
            <div data-interactable={interactable} data-phone={phoneNumber}>
                TicketVoiceCallCustomerLabel {customerId}
            </div>
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
        getOutboundDisplayStatus: jest.fn(),
    }
})
const getOutboundDisplayStatusMock = assumeMock(getOutboundDisplayStatus)

const renderComponent = (voiceCall: any) => {
    return render(<TicketVoiceCallOutboundStatus voiceCall={voiceCall} />)
}

describe('TicketVoiceCallOutboundStatus', () => {
    it.each([
        [VoiceCallDisplayStatus.Ringing, 'Waiting for'],
        [VoiceCallDisplayStatus.Failed, 'Failed:'],
        [VoiceCallDisplayStatus.Unanswered, 'Unanswered by'],
    ])(
        'should render the correct status message when voice call status is %s',
        (displayStatus, expectedText) => {
            getOutboundDisplayStatusMock.mockReturnValue(displayStatus)
            const { getByText, container } = renderComponent({
                customer_id: '123',
                phone_number_source: '+1234567890',
            })
            expect(getByText(expectedText)).toBeInTheDocument()
            const agentLabel = container.querySelector(
                '[data-interactable="true"]',
            )
            expect(agentLabel).not.toBeInTheDocument()
        },
    )

    it.each([
        [VoiceCallDisplayStatus.InProgress, 'Answered by'],
        [VoiceCallDisplayStatus.Answered, 'Answered by'],
    ])(
        'should render the correct status message when voice call status is %s',
        (displayStatus, expectedText) => {
            getOutboundDisplayStatusMock.mockReturnValue(displayStatus)
            const { getByText, container } = renderComponent({
                customer_id: '123',
                phone_number_source: '+1234567890',
                phone_number_destination: '+0987654321',
            })
            expect(getByText(expectedText)).toBeInTheDocument()
            const agentLabel = container.querySelector(
                '[data-interactable="true"]',
            )
            expect(agentLabel).toBeInTheDocument()
            expect(agentLabel?.getAttribute('data-phone')).toBe('+0987654321')
        },
    )

    it('should render null when voice call state is invalid', () => {
        getOutboundDisplayStatusMock.mockReturnValue(null)
        const voiceCall: VoiceCall = {
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const { container } = renderComponent(voiceCall)
        expect(container.firstChild).toBeNull()
    })

    it("should render events when voice call is 'Answered'", () => {
        getOutboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.Answered,
        )
        const voiceCall = {
            customer_id: '123',
            phone_number_source: '+1234567890',
            phone_number_destination: '+0987654321',
        }

        const { getByText, getByTestId } = renderComponent(voiceCall)

        expect(getByText('Answered by')).toBeInTheDocument()
        expect(getByTestId('collapsible-details')).toBeInTheDocument()
    })

    it('should pass interactable prop to VoiceCallCustomerLabel', () => {
        getOutboundDisplayStatusMock.mockReturnValue(
            VoiceCallDisplayStatus.InProgress,
        )
        const voiceCall = {
            customer_id: '123',
            phone_number_source: '+1234567890',
            phone_number_destination: '+0987654321',
        }

        const { container } = renderComponent(voiceCall)
        const customerLabel = container.querySelector(
            '[data-interactable="true"]',
        )
        expect(customerLabel).toBeInTheDocument()
        expect(customerLabel?.getAttribute('data-phone')).toBe('+0987654321')
    })
})
