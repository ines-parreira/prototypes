// @flow

import React from 'react'
import {shallow} from 'enzyme'

import ShopifyMoneySymbol from '../../shared/MoneySymbol'

describe('<ShopifyMoneySymbol/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <ShopifyMoneySymbol currencyCode="AUD"/>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with short symbol', () => {
            const component = shallow(
                <ShopifyMoneySymbol
                    currencyCode="AUD"
                    short
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
