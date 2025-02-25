import React from 'react'

import { render, screen } from '@testing-library/react'

import { BaseButtonContext } from '../BaseButton'
import ButtonSpinner from '../ButtonSpinner'

describe('<ButtonSpinner />', () => {
    it('should render a spinner', () => {
        render(<ButtonSpinner />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
        expect(screen.getByRole('status')).toHaveAttribute('width', '22')
    })

    it('should render a small loader', () => {
        render(
            <BaseButtonContext.Provider value={{ size: 'small' }}>
                <ButtonSpinner />
            </BaseButtonContext.Provider>,
        )

        expect(screen.getByRole('status')).toHaveAttribute('width', '15')
    })
})
