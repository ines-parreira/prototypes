import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import RecordsTableSkeleton from '../RecordsTableSkeleton'

describe('RecordsTableSkeleton', () => {
    const renderComponent = () => render(<RecordsTableSkeleton />)

    it('should render 3 rows with 4 cells', () => {
        renderComponent()

        const rows = screen.getAllByRole('row')
        expect(rows).toHaveLength(3)

        const cells = screen.getAllByRole('cell')
        expect(cells).toHaveLength(12)
        expect(screen.getAllByLabelText('Loading')).toHaveLength(12)
    })
})
