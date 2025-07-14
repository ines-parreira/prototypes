import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'

import { DistributionCategoryCell } from 'domains/reporting/pages/ticket-insights/components/DistributionCategoryCell'

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
            <table>
                <tbody>
                    <tr>
                        <DistributionCategoryCell
                            {...minProps}
                            category={'Level 0::Level 1'}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(
            screen.getByText(new RegExp('Level 0 > Level 1')),
        ).toBeInTheDocument()
    })
})
