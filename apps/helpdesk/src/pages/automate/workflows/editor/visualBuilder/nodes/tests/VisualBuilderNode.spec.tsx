import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'

import VisualBuilderNode from '../VisualBuilderNode'

describe('<VisualBuilderNode />', () => {
    it('should stop propagation if node is not clickable', () => {
        const mockOnClick = jest.fn()

        render(
            <div onClick={mockOnClick}>
                <ReactFlowProvider>
                    <VisualBuilderNode isClickable={false}>
                        test
                    </VisualBuilderNode>
                </ReactFlowProvider>
            </div>,
        )

        act(() => {
            fireEvent.click(screen.getByText('test'))
        })

        expect(mockOnClick).not.toHaveBeenCalled()
    })
})
