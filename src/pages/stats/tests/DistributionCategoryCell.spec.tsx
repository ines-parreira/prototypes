import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { DistributionCategoryCell } from '../DistributionCategoryCell'

describe('<DistributionCategoryCell />', () => {
    const minProps: ComponentProps<typeof DistributionCategoryCell> = {
        category: 'Category',
        progress: 50,
    }

    afterAll(() => {
        jest.resetAllMocks()
    })

    it('should render the cell', () => {
        render(
            <DistributionCategoryCell
                {...minProps}
                category={'Level 0::Level 1'}
            />,
        )

        expect(screen.getByText('Level 0 > Level 1')).toBeInTheDocument()
    })
})
