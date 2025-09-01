import { render, screen } from '@testing-library/react'

import { TransferTargetLabel } from './TransferTargetLabel'
import { TransferTarget, TransferType } from './types'

jest.mock(
    'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel',
    () =>
        ({ agentId }: { agentId: number }) => (
            <div>Agent Label (ID: {agentId})</div>
        ),
)

jest.mock(
    'pages/common/components/VoiceCallCustomerLabel/VoiceCallCustomerLabel',
    () =>
        ({
            phoneNumber,
            customerName,
            customerId,
            showBothNameAndPhone,
        }: any) => (
            <div>
                {customerName || `Customer ${customerId}`}
                {showBothNameAndPhone && ` (${phoneNumber})`}
            </div>
        ),
)

describe('<TransferTargetLabel />', () => {
    it('should render agent transfer label', () => {
        const transferTarget: TransferTarget = {
            id: 1,
            type: TransferType.Agent,
        }

        render(<TransferTargetLabel transferringTo={transferTarget} />)

        expect(screen.getByText(/Transferring call to/)).toBeInTheDocument()
        expect(screen.getByText('Agent Label (ID: 1)')).toBeInTheDocument()
    })

    it('should render external transfer label without customer', () => {
        const transferTarget: TransferTarget = {
            type: TransferType.External,
            value: '+15551234567',
            customer: null,
        }

        render(<TransferTargetLabel transferringTo={transferTarget} />)

        expect(screen.getByText(/Transferring call to/)).toBeInTheDocument()
        expect(screen.getByText('+15551234567')).toBeInTheDocument()
    })

    it('should render external transfer label with customer', () => {
        const transferTarget: TransferTarget = {
            type: TransferType.External,
            value: '+15551234567',
            customer: {
                id: 123,
                name: 'Guybrush Threepwood',
            },
        }

        render(<TransferTargetLabel transferringTo={transferTarget} />)

        expect(screen.getByText(/Transferring call to/)).toBeInTheDocument()
        expect(
            screen.getByText('Guybrush Threepwood (+15551234567)'),
        ).toBeInTheDocument()
    })
})
