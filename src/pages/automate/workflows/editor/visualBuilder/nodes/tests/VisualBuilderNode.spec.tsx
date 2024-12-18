import {act, fireEvent, render, screen} from '@testing-library/react'
import React from 'react'
import {ReactFlowProvider} from 'reactflow'

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
            </div>
        )

        act(() => {
            fireEvent.click(screen.getByText('test'))
        })

        expect(mockOnClick).not.toHaveBeenCalled()
    })
})
