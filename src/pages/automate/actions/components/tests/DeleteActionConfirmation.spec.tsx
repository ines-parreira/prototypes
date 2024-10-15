import React from 'react'
import {render, screen} from '@testing-library/react'
import DeleteActionConfirmation from '../DeleteActionConfirmation'

describe('<DeleteActionConfirmation />', () => {
    it('should render component', () => {
        render(
            <DeleteActionConfirmation
                isUpdatePending={false}
                onDelete={jest.fn()}
            />
        )

        expect(screen.getByText('delete')).toBeInTheDocument()
    })
})
