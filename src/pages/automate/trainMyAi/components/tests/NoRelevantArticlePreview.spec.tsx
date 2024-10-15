import React from 'react'
import {screen, render} from '@testing-library/react'
import NoRelevantArticlePreview from '../NoRelevantArticlePreview'

describe('<NoRelevantArticlePreview />', () => {
    it('should render component', () => {
        render(<NoRelevantArticlePreview />)

        expect(screen.getByText(/no relevant article/i)).toBeInTheDocument()
    })
})
