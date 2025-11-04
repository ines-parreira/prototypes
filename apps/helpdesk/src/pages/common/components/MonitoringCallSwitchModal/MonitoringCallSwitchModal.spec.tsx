import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

import MonitoringCallSwitchModal from './MonitoringCallSwitchModal'

jest.mock('pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel')

const VoiceCallAgentLabelMock = assumeMock(VoiceCallAgentLabel)

describe('MonitoringCallSwitchModal', () => {
    const mockOnClose = jest.fn()
    const mockOnConfirm = jest.fn()

    beforeEach(() => {
        VoiceCallAgentLabelMock.mockImplementation(({ agentId }) => (
            <span data-testid={`agent-${agentId}`}>Agent {agentId}</span>
        ))
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when isOpen is false', () => {
        render(
            <MonitoringCallSwitchModal
                isOpen={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                newMonitoredAgentId={42}
            />,
        )

        expect(screen.queryByText('Switch call?')).not.toBeInTheDocument()
    })

    it('should render with agent label when new agent id is provided', () => {
        render(
            <MonitoringCallSwitchModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                newMonitoredAgentId={42}
            />,
        )

        expect(screen.getByText('Switch call?')).toBeInTheDocument()
        expect(screen.getByTestId('agent-42')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'No, continue listening' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Yes, switch call' }),
        ).toBeInTheDocument()
    })

    it('should render fallback text when new agent id is null', () => {
        render(
            <MonitoringCallSwitchModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                newMonitoredAgentId={null}
            />,
        )

        expect(screen.queryByTestId(/agent-/)).not.toBeInTheDocument()
        expect(
            screen.getByText(/start listening to this agent instead/),
        ).toBeInTheDocument()
    })

    it('should call onClose when cancel button is clicked', async () => {
        const user = userEvent.setup()

        render(
            <MonitoringCallSwitchModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                newMonitoredAgentId={42}
            />,
        )

        await act(() =>
            user.click(
                screen.getByRole('button', { name: 'No, continue listening' }),
            ),
        )

        expect(mockOnClose).toHaveBeenCalledTimes(1)
        expect(mockOnConfirm).not.toHaveBeenCalled()
    })

    it('should call onConfirm when switch button is clicked', async () => {
        const user = userEvent.setup()

        render(
            <MonitoringCallSwitchModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                newMonitoredAgentId={42}
            />,
        )

        await act(() =>
            user.click(
                screen.getByRole('button', { name: 'Yes, switch call' }),
            ),
        )

        expect(mockOnConfirm).toHaveBeenCalledTimes(1)
        expect(mockOnClose).not.toHaveBeenCalled()
    })
})
