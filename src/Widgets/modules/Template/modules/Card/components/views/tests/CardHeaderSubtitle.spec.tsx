import {render, screen} from '@testing-library/react'
import React from 'react'

import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

describe('<CardHeaderSubtitle/>', () => {
    it('should set container class to wrapping element', () => {
        const child = 'foo'
        render(<CardHeaderSubtitle>{child}</CardHeaderSubtitle>)

        expect(screen.getByText(child)).toHaveClass('container')
    })
})
