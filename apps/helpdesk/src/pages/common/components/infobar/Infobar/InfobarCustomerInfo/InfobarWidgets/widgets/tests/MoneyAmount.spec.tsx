import React from 'react'

import { render } from '@testing-library/react'

import MoneyAmount from '../MoneyAmount'

describe('<MoneyAmount/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const { container } = render(
                <MoneyAmount amount="9.99" currencyCode="AUD" />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render as negative value', () => {
            const { container } = render(
                <MoneyAmount amount="9.99" currencyCode="AUD" negative />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render 0 as an horizontal dash symbol', () => {
            const { container } = render(
                <MoneyAmount amount="0.00" currencyCode="AUD" />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render 0 as a number', () => {
            const { container } = render(
                <MoneyAmount amount="0.00" currencyCode="AUD" renderIfZero />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
