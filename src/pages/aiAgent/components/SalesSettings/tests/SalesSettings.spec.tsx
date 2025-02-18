import {render, screen} from '@testing-library/react'
import React from 'react'

import {SalesSettings} from '../SalesSettings'

const renderComponent = () => render(<SalesSettings />)

describe('<SalesSettings />', () => {
    it('should render', () => {
        renderComponent()

        expect(screen.getByRole('button', {name: 'Save'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
    })
})
