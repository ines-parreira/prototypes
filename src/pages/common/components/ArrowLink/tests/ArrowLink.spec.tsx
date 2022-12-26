import React from 'react'
import {render, screen} from '@testing-library/react'

import ArrowLink from '../ArrowLink'

describe('ArrowLink component', () => {
    it('should render with a to attribute', () => {
        const {container} = render(<ArrowLink href="/here">Hello</ArrowLink>)
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render with an href attribute', () => {
        render(<ArrowLink href="https://something.com">Hello</ArrowLink>)
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href')
    })
})
