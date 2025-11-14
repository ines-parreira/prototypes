import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { Header } from '../Header'

describe('Header', () => {
    it("should render 'New user' when isEdit is false", () => {
        const { getByText } = render(
            <MemoryRouter>
                <Header isEdit={false} name="" />
            </MemoryRouter>,
        )
        expect(getByText('New user')).toBeInTheDocument()
    })

    it('should render the name when isEdit is true', () => {
        const { getByText } = render(
            <MemoryRouter>
                <Header isEdit name="Test User" />
            </MemoryRouter>,
        )
        expect(getByText('Test User')).toBeInTheDocument()
    })
})
