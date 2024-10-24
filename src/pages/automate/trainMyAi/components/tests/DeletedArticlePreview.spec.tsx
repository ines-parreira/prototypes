import {screen, render} from '@testing-library/react'
import React from 'react'

import DeletedArticlePreview from '../DeletedArticlePreview'

describe('<DeletedArticlePreview />', () => {
    it('should render component', () => {
        render(<DeletedArticlePreview />)

        expect(
            screen.getByText(/article has been deleted/i)
        ).toBeInTheDocument()
    })
})
