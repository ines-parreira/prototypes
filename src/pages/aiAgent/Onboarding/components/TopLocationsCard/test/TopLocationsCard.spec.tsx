import {render, screen} from '@testing-library/react'
import React from 'react'

import TopLocationsCard from '../TopLocationsCard'

const locations = [
    {
        id: '1',
        title: 'New York',
        percentage: 100,
    },
    {
        id: '2',
        title: 'New York',
        percentage: 82,
    },
    {
        id: '3',
        title: 'New York',
        percentage: 75,
    },
    {
        id: '4',
        title: 'New York',
        percentage: 26,
    },
]

describe('TopLocationsCard', () => {
    it('renders', () => {
        render(<TopLocationsCard title="Top Locations" locations={locations} />)

        expect(screen.getByText('Top Locations')).toBeInTheDocument()
        expect(screen.getAllByText('New York').length).toBe(4)
    })
})
