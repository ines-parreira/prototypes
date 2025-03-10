import React from 'react'

import { render } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    getOutboundDisplayStatus,
    VoiceCall,
    VoiceCallDisplayStatus,
    VoiceCallStatus,
} from 'models/voiceCall/types'
import { assumeMock } from 'utils/testing'

import TicketVoiceCallOutboundStatus from '../TicketVoiceCallOutboundStatus'

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({ customerId }: { customerId: string }) => (
            <div>TicketVoiceCallCustomerLabel {customerId}</div>
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
        getOutboundDisplayStatus: jest.fn(),
    }
})
const getOutboundDisplayStatusMock = assumeMock(getOutboundDisplayStatus)

const renderComponent = (voiceCall: any) => {
    return render(<TicketVoiceCallOutboundStatus voiceCall={voiceCall} />)
}

describe('TicketVoiceCallOutboundStatus old', () => {
    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return false
            }
        })
    })

    it.each([
        [VoiceCallStatus.Canceled, 'Call missed by'],
        [VoiceCallStatus.NoAnswer, 'Call missed by'],
        [VoiceCallStatus.Answered, 'Answered by'],
        [VoiceCallStatus.Connected, 'Answered by'],
        [VoiceCallStatus.Completed, 'Answered by'],
        [VoiceCallStatus.Failed, 'Failed:'],
        [VoiceCallStatus.Ringing, 'Waiting for'],
        [VoiceCallStatus.InProgress, 'Waiting for'],
    ])(
        'should render the correct status message based on the voice call status',
        (status, expectedText) => {
            const voiceCall = {
                status,
                customer_id: '123',
                phone_number_source: '+1234567890',
            }
            const { getByText } = renderComponent(voiceCall)
            expect(getByText(expectedText)).toBeInTheDocument()
        },
    )

    it('should render null when voice call state is invalid', () => {
        const voiceCall: VoiceCall = {
            status: 'some-status' as VoiceCallStatus,
            last_answered_by_agent_id: 1,
            phone_number_destination: '1234567890',
        } as VoiceCall
        const { container } = renderComponent(voiceCall)
        expect(container.firstChild).toBeNull()
    })

    it("should render events when voice call is 'Answered'", () => {
        const voiceCall = {
            status: VoiceCallStatus.Connected,
            customer_id: '123',
            phone_number_source: '+1234567890',
        }

        const { getByText, getByTestId } = renderComponent(voiceCall)

        expect(getByText('Answered by')).toBeInTheDocument()
        expect(getByTestId('collapsible-details')).toBeInTheDocument()
    })
})

describe('TicketVoiceCallOutboundStatus', () => {
    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.ShowNewUnansweredStatuses) {
                return true
            }
        })
    })

    it.each([
        [VoiceCallDisplayStatus.Ringing, 'Waiting for'],
        [VoiceCallDisplayStatus.Failed, 'Failed:'],
        [VoiceCallDisplayStatus.InProgress, 'Answered by'],
        [VoiceCallDisplayStatus.Answered, 'Answered by'],
        [VoiceCallDisplayStatus.Unanswered, 'Unanswered by'],
    ])(
        'should render the correct status message based on the voice call status',
        (displayStatus, expectedText) => {
            getOutboundDisplayStatusMock.mockReturnValue(displayStatus)
            const { getByText } = renderComponent({
                customer_id: '123',
                phone_number_source: '+1234567890',
            })
            expect(getByText(expectedText)).toBeInTheDocument()
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
        }

        const { getByText, getByTestId } = renderComponent(voiceCall)

        expect(getByText('Answered by')).toBeInTheDocument()
        expect(getByTestId('collapsible-details')).toBeInTheDocument()
    })
})
