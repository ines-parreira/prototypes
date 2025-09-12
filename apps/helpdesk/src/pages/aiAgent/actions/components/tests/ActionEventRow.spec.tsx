import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import user from '@testing-library/user-event'

import { renderWithRouter } from 'utils/testing'

import { LlmTriggeredExecution } from '../../types'
import ActionEventRow from '../ActionEventRow'

describe('<ActionEventRow />', () => {
    const mockOnClick = jest.fn()
    const mockWindowOpen = jest.fn()

    const defaultExecution: LlmTriggeredExecution = {
        id: 'execution-1',
        configuration_id: 'config-1',
        configuration_internal_id: 'internal-1',
        current_step_id: 'step-1',
        trigger: 'llm-prompt',
        triggerable: false,
        status: 'success',
        updated_datetime: '2024-01-15T10:30:00Z',
        state: {
            trigger: 'llm-prompt',
            channel: 'email',
            user_journey_id: 'journey-456',
        },
        awaited_callbacks: [],
        channel_actions: [],
    } as LlmTriggeredExecution

    beforeEach(() => {
        jest.clearAllMocks()
        Object.defineProperty(window, 'open', {
            writable: true,
            value: mockWindowOpen,
        })
    })

    it('should render component', () => {
        renderWithRouter(
            <ActionEventRow
                execution={defaultExecution}
                isSelected={false}
                onClick={mockOnClick}
            />,
        )

        expect(screen.getByText('01/15/2024')).toBeInTheDocument()
    })

    it('should display test mode message when journey id is 123', () => {
        const testModeExecution = {
            ...defaultExecution,
            state: {
                ...defaultExecution.state,
                user_journey_id: '123',
            },
        }

        renderWithRouter(
            <ActionEventRow
                execution={testModeExecution}
                isSelected={false}
                onClick={mockOnClick}
            />,
        )

        expect(
            screen.getByText('Action performed in test mode'),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: '123' }),
        ).not.toBeInTheDocument()
    })

    it('should display normal journey id when not in test mode', () => {
        renderWithRouter(
            <ActionEventRow
                execution={defaultExecution}
                isSelected={false}
                onClick={mockOnClick}
            />,
        )

        const button = screen.getByRole('button', { name: 'journey-456' })
        expect(button).toBeInTheDocument()
        expect(button).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('should not open ticket when clicking on test mode text', async () => {
        const testModeExecution = {
            ...defaultExecution,
            state: {
                ...defaultExecution.state,
                user_journey_id: '123',
            },
        }

        renderWithRouter(
            <ActionEventRow
                execution={testModeExecution}
                isSelected={false}
                onClick={mockOnClick}
            />,
        )

        const testModeText = screen.getByText('Action performed in test mode')
        await user.click(testModeText)

        await waitFor(() => {
            expect(mockWindowOpen).not.toHaveBeenCalled()
        })
    })

    it('should open ticket when journey button is clicked in normal mode', async () => {
        renderWithRouter(
            <ActionEventRow
                execution={defaultExecution}
                isSelected={false}
                onClick={mockOnClick}
            />,
        )

        const journeyButton = screen.getByRole('button', {
            name: 'journey-456',
        })
        await user.click(journeyButton)

        await waitFor(() => {
            expect(mockWindowOpen).toHaveBeenCalledWith(
                '/app/ticket/journey-456',
                '_blank',
            )
        })
    })
})
