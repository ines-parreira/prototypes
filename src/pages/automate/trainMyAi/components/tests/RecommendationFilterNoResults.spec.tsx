import React from 'react'
import {screen, render} from '@testing-library/react'
import RecommendationFilterNoResults from '../RecommendationFilterNoResults'

describe('<RecommendationFilterNoResults />', () => {
    it('should render component', () => {
        render(<RecommendationFilterNoResults onResetButtonClick={jest.fn()} />)
        expect(screen.getByText('Reset filters')).toBeInTheDocument()
    })
})
