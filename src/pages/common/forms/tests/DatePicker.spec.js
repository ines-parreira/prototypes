import React from 'react'
import {mount, shallow} from 'enzyme'
import moment from 'moment/moment'

import DatePicker from '../DatePicker'

describe('DatePicker', () => {
    it('should render a date range picker', () => {
        const datetime = moment('2017-12-22')
        const ranges = {
            'tomorrow': [datetime.add(1, 'days'), datetime.add(1, 'days')]
        }
        const component = shallow(
            <DatePicker
                isOpen={true}
                toggle={null}
                applyClass="btn-success mr-2"
                buttonClasses={['btn']}
                cancelClass="btn-secondary"
                minDate={datetime}
                onApply={null}
                opens="left"
                ranges={ranges}
                showCustomRangeLabel={false}
                singleDatePicker
                startDate={datetime}
                timePicker
            >
                Select a date
            </DatePicker>
        )

        expect(component).toMatchSnapshot()
    })

    it('should display a date range picker on mount', () => {
        const wrapper = shallow(
            <DatePicker
                isOpen={true}
                toggle={null}
            >
                Select a date
            </DatePicker>
        )
        const component = wrapper.instance()
        component._show = jest.fn()
        component.componentDidMount()
        expect(component._show).toHaveBeenCalled()
    })

    it('should display a date range picker on update', () => {
        const wrapper = shallow(
            <DatePicker
                isOpen={false}
                toggle={null}
            >
                Select a date
            </DatePicker>
        )
        const component = wrapper.instance()
        component._show = jest.fn()
        component.componentWillReceiveProps({isOpen: true})
        expect(component._show).toHaveBeenCalled()
    })

    it('should call toggle function and onHide callback on hide', () => {
        const toggleSpy = jest.fn()
        const onHideSpy = jest.fn()
        const wrapper = shallow(
            <DatePicker
                isOpen={false}
                toggle={toggleSpy}
                onHide={onHideSpy}
            >
                Select a date
            </DatePicker>
        )
        const component = wrapper.instance()
        component._onEvent({type: 'hide'})
        expect(toggleSpy).toHaveBeenCalled()
        expect(onHideSpy).toHaveBeenCalled()
    })

    it('should simulate a click to show the date range picker', () => {
        const wrapper = mount(
            <DatePicker
                isOpen={false}
                toggle={null}
            >
                Select a date
            </DatePicker>
        )
        const component = wrapper.instance()
        const showSpy = jest.fn()
        component.datePickerRef.$picker.click = showSpy
        component._show()
        expect(showSpy).toHaveBeenCalled()

    })
})
