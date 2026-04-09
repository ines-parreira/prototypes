import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FilterOperatorEnum } from 'models/selfServiceConfiguration/types'
import type { SelfServiceConfigurationFilter } from 'models/selfServiceConfiguration/types'

import { ReturnOrderEligibility } from './ReturnOrderEligibility'

describe('ReturnOrderEligibility', () => {
    const mockOnChange = jest.fn()

    const eligibility: SelfServiceConfigurationFilter = {
        key: 'order_delivered_at',
        value: '30',
        operator: FilterOperatorEnum.LESS_THAN,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render section title and description', () => {
        render(
            <ReturnOrderEligibility
                eligibility={eligibility}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('Eligibility window')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Customers can request a return when an order meets the following criteria:',
            ),
        ).toBeInTheDocument()
    })

    it('should render condition row when eligibility is provided', () => {
        render(
            <ReturnOrderEligibility
                eligibility={eligibility}
                onChange={mockOnChange}
            />,
        )

        expect(
            screen.getByRole('button', { name: /Eligibility condition/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('less than')).toBeInTheDocument()
        expect(screen.getByText('days ago')).toBeInTheDocument()
        expect(
            screen.getByRole('button', {
                name: 'Remove eligibility condition',
            }),
        ).toBeInTheDocument()
    })

    it('should render select without condition row when no eligibility is provided', () => {
        render(<ReturnOrderEligibility onChange={mockOnChange} />)

        expect(
            screen.getAllByLabelText('Eligibility condition').length,
        ).toBeGreaterThan(0)
        expect(screen.queryByText('less than')).not.toBeInTheDocument()
        expect(screen.queryByText('days ago')).not.toBeInTheDocument()
    })

    it('should call onChange with undefined when remove button is clicked', async () => {
        const user = userEvent.setup()

        render(
            <ReturnOrderEligibility
                eligibility={eligibility}
                onChange={mockOnChange}
            />,
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Remove eligibility condition',
            }),
        )

        expect(mockOnChange).toHaveBeenCalledWith()
    })
})
