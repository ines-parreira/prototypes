import React from 'react'
import {shallow} from 'enzyme'

import DatetimePicker from '../DatetimePicker'

describe('DatetimePicker component', () => {
    it('should display a placeholder when there\'s no data', () => {
        const component = shallow(
            <DatetimePicker datetime=""/>
        )

        expect(component).toMatchSnapshot()
    })

    it('should display the passed data', () => {
        const component = shallow(
            <DatetimePicker datetime="2012-03-21T08:32:12.045Z"/>
        )

        expect(component).toMatchSnapshot()
    })

    it('should ignore invalid passed data', () => {
        const component = shallow(
            <DatetimePicker datetime="7d"/>
        )

        expect(component).toMatchSnapshot()
    })

    it('should extract the data from the picker correctly', () => {
        const datetime = '2012-03-21T08:32:12.045Z'
        const spy = jest.fn()
        const wrapper = shallow(
            <DatetimePicker
                datetime={datetime}
                onChange={spy}
            />
        )

        const picker = {
            startDate: {
                toISOString: () => datetime
            }
        }

        const component = wrapper.instance()
        component._handleEvent(null, picker)

        expect(spy).toHaveBeenCalledWith(datetime)
    })
})
