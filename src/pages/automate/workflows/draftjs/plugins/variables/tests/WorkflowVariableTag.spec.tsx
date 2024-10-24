import {screen, act, fireEvent, render, waitFor} from '@testing-library/react'
import React, {useState} from 'react'

import WorkflowVariableTag from '../WorkflowVariableTag'

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}))

describe('<WorkflowVariableTag />', () => {
    beforeEach(() => {
        ;(useState as jest.Mock).mockImplementation(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            jest.requireActual('react').useState
        )
    })
    it('should trigger callback on click', () => {
        const mockOnClick = jest.fn()

        render(
            <WorkflowVariableTag value="test" onClick={mockOnClick}>
                <div />
            </WorkflowVariableTag>
        )

        act(() => {
            fireEvent.click(screen.getByLabelText('Invalid variable'))
        })

        expect(mockOnClick).toHaveBeenCalled()
    })

    it('should display tooltip when text overflow', async () => {
        // Mock isTextOverflow since JSDOM doesn't support layout
        jest.spyOn(React, 'useState').mockImplementation(() => [
            true,
            jest.fn(),
        ])

        render(
            <WorkflowVariableTag value="test" onClick={jest.fn()}>
                ipsum dolor sit amet, consectetur adipiscing elit.
            </WorkflowVariableTag>
        )

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

        fireEvent.mouseOver(
            screen.getByText(
                'ipsum dolor sit amet, consectetur adipiscing elit.'
            )
        )

        await waitFor(() => {
            expect(screen.queryByRole('tooltip')).toBeInTheDocument()
        })
    })
})
