import { render, screen } from '@testing-library/react'

import { MaximumDiscountField } from './MaximumDiscount'

describe('<MaximumDiscountField />', () => {
    it('should accept default value', () => {
        render(<MaximumDiscountField value={'10'} />)

        const input = screen.getByRole('spinbutton')
        expect(input).toHaveValue(10)
    })
    it('should render field information and info', () => {
        render(<MaximumDiscountField />)
        expect(screen.getByText('Discount code value')).toBeInTheDocument()
    })

    it('should call onChange with empty string when disabled and value is set', () => {
        const onChange = jest.fn()
        render(
            <MaximumDiscountField
                value="10"
                isDisabled={true}
                onChange={onChange}
            />,
        )
        expect(onChange).toHaveBeenCalledWith('')
    })
})
