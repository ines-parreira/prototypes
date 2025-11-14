import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import HomePageLink from '../HomePageLink'

describe('<HomePageLink />', () => {
    it('should render the link', () => {
        const { baseElement } = render(
            <MemoryRouter>
                <HomePageLink />
            </MemoryRouter>,
        )

        expect(screen.queryByText(/Home/)).toBeInTheDocument()
        expect(baseElement).toMatchSnapshot()
    })
})
