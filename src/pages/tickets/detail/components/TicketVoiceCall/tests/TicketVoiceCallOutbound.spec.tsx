import React from 'react'

import { render } from '@testing-library/react'

import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { OutboundVoiceCall, VoiceCall } from 'models/voiceCall/types'
import * as utils from 'models/voiceCall/utils'
import { userEvent } from 'utils/testing/userEvent'

import TicketVoiceCallOutbound from '../TicketVoiceCallOutbound'

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({ agentId }: { agentId: number }) => (
            <div>VoiceCallAgentLabel {agentId}</div>
        ),
)

jest.mock('pages/common/utils/DatetimeLabel', () => () => (
    <div>DatetimeLabel</div>
))

jest.mock('pages/tickets/detail/components/TicketVoiceCall/hooks', () => ({
    useAgentDetails: (agentId: number) => ({
        agent: {
            id: agentId,
            first_name: 'John',
            last_name: 'Doe',
        },
    }),
    useCustomerDetails: (customerId: number) => ({
        customer: {
            id: customerId,
            firstname: 'Jane Doe',
            lastname: 'Customer',
        },
    }),
}))

jest.mock(
    'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallOutboundStatus',
    () =>
        ({ voiceCall }: { voiceCall: VoiceCall }) => (
            <div>TicketVoiceCallOutboundStatus {voiceCall.status}</div>
        ),
)
jest.mock(
    'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCallDuration',
    () => () => <div>TicketVoiceCallDuration</div>,
)

const isFinalVoiceCallSpy = jest.spyOn(utils, 'isFinalVoiceCallStatus')

describe('TicketVoiceCallOutbound', () => {
    const voiceCall = {
        id: 1,
        phone_number_source: '+12133734253',
        phone_number_destination: '+12133734444',
        created_datetime: '2022-01-01T00:00:00.000Z',
        status: VoiceCallStatus.InProgress,
        initiated_by_agent_id: 123,
    } as OutboundVoiceCall

    const renderComponent = () => {
        return render(<TicketVoiceCallOutbound voiceCall={voiceCall} />)
    }

    it('renders the agent label', () => {
        const { getByText } = renderComponent()
        const agentLabel = getByText('VoiceCallAgentLabel 123')
        expect(agentLabel).toBeInTheDocument()
    })

    it('renders the call status', () => {
        const { getByText } = renderComponent()
        const callStatus = getByText(
            `TicketVoiceCallOutboundStatus ${voiceCall.status}`,
        )
        expect(callStatus).toBeInTheDocument()
    })

    it('renders the call icon with correct tooltip content', async () => {
        const { getByText, findByText } = renderComponent()
        const icon = getByText('call_made')
        expect(icon).toBeInTheDocument()

        userEvent.hover(icon)

        await findByText('+1 213 373 4253')
        expect(
            getByText('Jane Doe Customer (+1 213 373 4444)'),
        ).toBeInTheDocument()
    })

    it('displays correct header when call is still in progress', () => {
        isFinalVoiceCallSpy.mockReturnValue(false)
        const { getByText } = renderComponent()
        const header = getByText('is making a call')
        expect(header).toBeInTheDocument()
    })

    it('displays correct header when call is finished', () => {
        isFinalVoiceCallSpy.mockReturnValue(true)
        const { getByText } = renderComponent()
        const header = getByText('made a call')
        expect(header).toBeInTheDocument()
    })
})
