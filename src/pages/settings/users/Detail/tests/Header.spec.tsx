import React from 'react'
import {render} from '@testing-library/react'

import {Header} from '../Header'

describe('Header', () => {
    it("should render 'New user' when isEdit is false", () => {
        const {getByText} = render(<Header isEdit={false} name="" />)
        expect(getByText('New user')).toBeInTheDocument()
    })

    it('should render the name when isEdit is true', () => {
        const {getByText} = render(<Header isEdit name="Test User" />)
        expect(getByText('Test User')).toBeInTheDocument()
    })
})
