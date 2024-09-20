import React from 'react'
import {screen, act, fireEvent, render} from '@testing-library/react'

import WorkflowVariableTag from '../WorkflowVariableTag'

describe('<WorkflowVariableTag />', () => {
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
})
