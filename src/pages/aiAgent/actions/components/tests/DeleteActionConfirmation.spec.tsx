import {render, screen} from '@testing-library/react'
import React from 'react'

import DeleteActionConfirmation from '../DeleteActionConfirmation'

describe('<DeleteActionConfirmation />', () => {
    it('should render component', () => {
        render(
            <DeleteActionConfirmation isDisabled={false} onDelete={jest.fn()} />
        )

        expect(screen.getByText('delete')).toBeInTheDocument()
    })
})
