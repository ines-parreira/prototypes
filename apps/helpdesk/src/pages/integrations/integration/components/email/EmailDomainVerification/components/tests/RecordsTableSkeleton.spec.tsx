import React from 'react'

import { render, screen } from '@testing-library/react'

import RecordsTableSkeleton from '../RecordsTableSkeleton'

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Skeleton: () => <div> Skeleton</div>,
}))

describe('RecordsTableSkeleton', () => {
    const renderComponent = () => render(<RecordsTableSkeleton />)

    it('should render 3 rows with 4 cells', () => {
        renderComponent()

        const rows = screen.getAllByRole('row')
        expect(rows).toHaveLength(3)

        const cells = screen.getAllByRole('cell')
        expect(cells).toHaveLength(12)
        expect(screen.getAllByText('Skeleton')).toHaveLength(12)
    })
})
