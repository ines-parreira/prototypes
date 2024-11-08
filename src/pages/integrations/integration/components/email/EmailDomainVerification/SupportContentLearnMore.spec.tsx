import {screen, render} from '@testing-library/react'
import React from 'react'

import SupportContentLearnMore from './SupportContentLearnMore'

describe('SupportContentLearnMore', () => {
    it('should render icons and children ', () => {
        render(
            <SupportContentLearnMore url="https://www.godaddy.com/">
                Learn More
            </SupportContentLearnMore>
        )

        expect(screen.getByText('menu_book')).toBeInTheDocument()
        expect(screen.getByText('open_in_new')).toBeInTheDocument()
        expect(screen.getByText('Learn More')).toBeInTheDocument()
    })
})
