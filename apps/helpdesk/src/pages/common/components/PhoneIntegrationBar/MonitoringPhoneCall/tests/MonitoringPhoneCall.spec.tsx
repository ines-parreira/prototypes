import { screen } from '@testing-library/react'
import user from '@testing-library/user-event'
import { Call } from '@twilio/voice-sdk'
import { fromJS } from 'immutable'

import { mockMonitoringCall } from 'tests/twilioMocks'
import { renderWithStore } from 'utils/testing'

import MonitoringPhoneCall from '../MonitoringPhoneCall'

jest.mock('@twilio/voice-sdk')

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () => ({
        __esModule: true,
        default: ({
            customerId,
            phoneNumber,
        }: {
            customerId: number
            phoneNumber: string
        }) => (
            <span data-testid="customer-label">
                Customer {customerId} ({phoneNumber})
            </span>
        ),
    }),
)

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () => ({
        __esModule: true,
        default: ({ agentId }: { agentId: number }) => (
            <span data-testid="agent-label">Agent {agentId}</span>
        ),
    }),
)

describe('MonitoringPhoneCall', () => {
    const integrationId = 1
    const inCallAgentId = 123
    const customerId = 456
    const customerPhoneNumber = '+14158880101'

    const integration = {
        id: integrationId,
        name: 'My Phone Integration',
        meta: {
            emoji: '❤️',
        },
    }

    const initialState = {
        integrations: fromJS({
            integrations: [integration],
        }),
    }

    it('should render stop listening button', () => {
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderWithStore(<MonitoringPhoneCall call={call} />, initialState)

        expect(
            screen.getByRole('button', { name: /Stop Listening/i }),
        ).toBeInTheDocument()
    })

    it('should disconnect call when stop listening button is clicked', async () => {
        const userEvent = user.setup()
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderWithStore(<MonitoringPhoneCall call={call} />, initialState)

        await userEvent.click(
            screen.getByRole('button', { name: /Stop Listening/i }),
        )

        expect(call.disconnect).toHaveBeenCalled()
    })

    it('should display integration, customer and agent information', () => {
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderWithStore(<MonitoringPhoneCall call={call} />, initialState)

        expect(screen.getByText('My Phone Integration')).toBeInTheDocument()
        expect(screen.getByTestId('customer-label')).toHaveTextContent(
            `Customer ${customerId} (${customerPhoneNumber})`,
        )
        expect(screen.getByTestId('agent-label')).toHaveTextContent(
            `Agent ${inCallAgentId}`,
        )
    })

    it('should display connected status', () => {
        const call = mockMonitoringCall(
            integrationId,
            inCallAgentId,
            customerId,
            customerPhoneNumber,
        ) as Call

        renderWithStore(<MonitoringPhoneCall call={call} />, initialState)

        expect(screen.getByText('Connected')).toBeInTheDocument()
    })
})
