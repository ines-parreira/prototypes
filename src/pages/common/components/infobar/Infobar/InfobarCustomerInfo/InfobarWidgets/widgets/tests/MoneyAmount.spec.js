// @flow

import React from 'react'
import {shallow} from 'enzyme'

import MoneyAmount from '../MoneyAmount'

describe('<MoneyAmount/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <MoneyAmount amount="9.99" currencyCode="AUD" />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as negative value', () => {
            const component = shallow(
                <MoneyAmount amount="9.99" currencyCode="AUD" negative />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render 0 as an horizontal dash symbol', () => {
            const component = shallow(
                <MoneyAmount amount="0.00" currencyCode="AUD" />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render 0 as a number', () => {
            const component = shallow(
                <MoneyAmount amount="0.00" currencyCode="AUD" renderIfZero />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
