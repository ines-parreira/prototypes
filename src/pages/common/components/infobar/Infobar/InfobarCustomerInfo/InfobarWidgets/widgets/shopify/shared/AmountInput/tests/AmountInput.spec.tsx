import React from 'react'
import {shallow} from 'enzyme'

import AmountInput from '../AmountInput'

describe('<AmountInput/>', () => {
    let onChange: jest.MockedFunction<any>

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

            component
                .find({id: 'amount'})
                .simulate('change', {target: {value: '10'}})
            expect(onChange).toHaveBeenCalledWith('10')
        })
    })

    describe('_onBlur()', () => {
        it('should update value with formatted price', () => {
            const component = shallow(
                <AmountInput
                    currencyCode="USD"
                    onChange={onChange}
                    value="9.99"
                />
            )

            const target = {value: '10'}
            component.find({id: 'amount'}).simulate('blur', {target})
            expect(target.value).toBe('10.00')
            expect(onChange).toHaveBeenCalledWith('10.00')
        })

        it('should update value with formatted price when input is empty', () => {
            const component = shallow(
                <AmountInput
                    currencyCode="USD"
                    onChange={onChange}
                    value="9.99"
                />
            )

            const target = {value: ''}
            component.find({id: 'amount'}).simulate('blur', {target})
            expect(target.value).toBe('0.00')
            expect(onChange).toHaveBeenCalledWith('0.00')
        })
    })
})
