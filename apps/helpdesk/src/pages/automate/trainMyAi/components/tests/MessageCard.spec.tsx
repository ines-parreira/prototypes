import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { Header, TRAIN_ARTICLE_RECOMMENDATIONS_DOCS_URL } from '../Header'

describe('<Header />', () => {
    it('should render component', () => {
        render(<Header />)

        const docsLink = screen.getByRole('link', {
            name: /how to train article recommendations/i,
        })

        expect(docsLink).toBeInTheDocument()
        expect(docsLink).toHaveAttribute(
            'href',
            TRAIN_ARTICLE_RECOMMENDATIONS_DOCS_URL,
        )
    })
})
