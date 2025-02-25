import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AmountInput from 'Widgets/modules/Shopify/modules/AmountInput'

describe('<AmountInput/>', () => {
    let onChange: jest.MockedFunction<any>

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render with currency symbol on left', () => {
            const { container } = render(
                <AmountInput
                    currencyCode="USD"
                    onChange={onChange}
                    value={9.99}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with percentage symbol on right', () => {
            const { container } = render(
                <AmountInput
                    currencyCode="USD"
                    onChange={onChange}
                    value={25}
                    symbol="%"
                    max={100}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('onChange()', () => {
        it('should call prop `onChange` with new value', () => {
            render(
                <AmountInput
                    currencyCode="USD"
                    onChange={onChange}
                    value={9.99}
                />,
            )

            userEvent.click(screen.getByText('arrow_drop_up'))

            expect(onChange).toHaveBeenCalledWith(10)
        })
    })
})
