// @flow

import React from 'react'
import {shallow} from 'enzyme'

import AmountInput from '../AmountInput'

describe('<AmountInput/>', () => {
    let onChange

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render with currency symbol on left', () => {
            const component = shallow(
                <AmountInput
                    currencyCode="USD"
                    onChange={onChange}
                    value="9.99"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with currency symbol on right', () => {
            const component = shallow(
                <AmountInput
                    currencyCode="EUR"
                    onChange={onChange}
                    value="9.99"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render with percentage symbol on right', () => {
            const component = shallow(
                <AmountInput
                    currencyCode="USD"
                    onChange={onChange}
                    value="25"
                    symbol="%"
                    max={100}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('onChange()', () => {
        it('should call prop `onChange` with new value', () => {
            const component = shallow(
                <AmountInput
                    currencyCode="USD"
                    onChange={onChange}
                    value="9.99"
                />
            )

            component.find({id: 'amount'}).simulate('change', {target: {value: '10'}})
            expect(onChange).toHaveBeenCalledWith({target: {value: '10'}})
        })
    })
})
