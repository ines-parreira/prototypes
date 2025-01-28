import {render, screen} from '@testing-library/react'
import React from 'react'

import TopElementsCard from '../TopElementsCard'

const elements = [
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

describe('TopElementsCard', () => {
    it('renders', () => {
        render(<TopElementsCard title="Top Elements" topElements={elements} />)

        expect(screen.getByText('Top Elements')).toBeInTheDocument()
        expect(screen.getAllByText('New York').length).toBe(4)
    })
})
