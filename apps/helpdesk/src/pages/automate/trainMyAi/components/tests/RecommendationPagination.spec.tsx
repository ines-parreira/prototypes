import React from 'react'

import { render, screen } from '@testing-library/react'

import RecommendationPagination from '../RecommendationPagination'

describe('<RecommendationPagination />', () => {
    it('should render component', () => {
        render(
            <RecommendationPagination
                onChange={jest.fn()}
                count={10}
                page={1}
            />,
        )

        expect(screen.getByText('10')).toBeInTheDocument()
    })
})
