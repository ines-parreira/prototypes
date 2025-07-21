import React from 'react'

import { render, screen } from '@testing-library/react'

import HomePageLink from '../HomePageLink'

describe('<HomePageLink />', () => {
    it('should render the link', () => {
        const { baseElement } = render(<HomePageLink />)

        expect(screen.queryByText(/Home/)).toBeInTheDocument()
        expect(baseElement).toMatchSnapshot()
    })
})
