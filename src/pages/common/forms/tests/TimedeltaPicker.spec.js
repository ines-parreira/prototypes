import React from 'react'
import {shallow} from 'enzyme'

import TimedeltaPicker from '../TimedeltaPicker.tsx'

describe('TimedeltaPicker component', () => {
    it('should render correct passed data', () => {
        const component = shallow(
            <TimedeltaPicker value="2w" onChange={() => {}} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should ignore incorrect passed data and use default values instead', () => {
        const component = shallow(
            <TimedeltaPicker value="d1" onChange={() => {}} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should handle unit change', () => {
        const wrapper = shallow(
            <TimedeltaPicker value="" onChange={() => {}} />
        )

        const component = wrapper.instance()

        component._onUnitChange('w')
        expect(wrapper.state()).toMatchSnapshot()

        component._onUnitChange('m')
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('should handle quantity change', () => {
        const wrapper = shallow(
            <TimedeltaPicker value="" onChange={() => {}} />
        )

        const component = wrapper.instance()

        component._onQuantityChange('5')
        expect(wrapper.state()).toMatchSnapshot()

        component._onQuantityChange('10')
        expect(wrapper.state()).toMatchSnapshot()
    })

    it('should call passed onChange with the correct value', () => {
        const spy = jest.fn()
        const wrapper = shallow(<TimedeltaPicker value="" onChange={spy} />)

        const component = wrapper.instance()
        component._onChange(2, 'm')

        expect(spy).toHaveBeenCalledTimes(1)

        expect(spy.mock.calls[0].length).toBe(1) // called with one argument
        expect(spy.mock.calls[0][0]).toBe('2m')
    })

    it('should build state correctly', () => {
        const wrapper = shallow(
            <TimedeltaPicker value="" onChange={() => {}} />
        )

        const component = wrapper.instance()

        let res = component._buildValue('5w')
        expect(res).toEqual({quantity: 5, unit: 'w'})

        res = component._buildValue('')
        expect(res).toEqual({quantity: 1, unit: 'd'})
    })
})
