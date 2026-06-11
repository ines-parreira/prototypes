import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { DeleteActionConfirmation } from '../DeleteActionConfirmation'

describe('<DeleteActionConfirmation />', () => {
    it('should render component', () => {
        render(
            <DeleteActionConfirmation
                isDisabled={false}
                onDelete={jest.fn()}
            />,
        )

        expect(screen.getByText('delete')).toBeInTheDocument()
    })
})
