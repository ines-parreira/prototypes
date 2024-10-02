import React from 'react'
import {render, act, screen, fireEvent} from '@testing-library/react'

import ActionFormInputVariable from '../components/ActionFormInputVariable'

describe('<ActionFormInputVariable />', () => {
    it('should render not full editable inputs', () => {
        const mockOnDeleteInput = jest.fn()

        render(
            <ActionFormInputVariable
                customInputs={[
                    {
                        id: 'test1',
                        name: 'test',
                        instructions: '',
                        dataType: 'string',
                        isNotFullyEditable: true,
                    },
                ]}
                onChange={jest.fn()}
                onAddInput={jest.fn()}
                onDeleteInput={mockOnDeleteInput}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('arrow_drop_down'))
        })

        expect(screen.getByRole('menu', {hidden: true})).toHaveAttribute(
            'aria-hidden',
            'true'
        )

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(mockOnDeleteInput).not.toHaveBeenCalled()
    })
})
