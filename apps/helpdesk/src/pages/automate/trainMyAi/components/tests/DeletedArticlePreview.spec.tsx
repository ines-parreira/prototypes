import React from 'react'

import { render, screen } from '@testing-library/react'

import DeletedArticlePreview from '../DeletedArticlePreview'

describe('<DeletedArticlePreview />', () => {
    it('should render component', () => {
        render(<DeletedArticlePreview />)

        expect(
            screen.getByText(/article has been deleted/i),
        ).toBeInTheDocument()
    })
})
