import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { Performance } from './Performance'

describe('<Performance />', () => {
    it('should render AI Journey landing page', () => {
        renderWithRouter(<Performance />)

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })
})
