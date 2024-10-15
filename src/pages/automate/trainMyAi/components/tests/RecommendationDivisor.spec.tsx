import React from 'react'
import {screen, render} from '@testing-library/react'
import RecommendationDivisor from '../RecommendationDivisor'

describe('<RecommendationDivisor />', () => {
    it('should render component', () => {
        render(<RecommendationDivisor />)
        expect(screen.getByText('recommended article')).toBeInTheDocument()
    })
})
