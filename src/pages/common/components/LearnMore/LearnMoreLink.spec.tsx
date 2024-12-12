import {screen, render} from '@testing-library/react'
import React from 'react'

import LearnMoreLink from './LearnMoreLink'

describe('LearnMoreLink', () => {
    it('should render icon and children ', () => {
        render(<LearnMoreLink url="www.gorgias.com">Learn More</LearnMoreLink>)

        expect(screen.getByText('menu_book')).toBeInTheDocument()
        expect(screen.getByText('Learn More')).toBeInTheDocument()
        expect(screen.getByText('Learn More').closest('a')).toHaveAttribute(
            'href',
            'www.gorgias.com'
        )
    })
})
