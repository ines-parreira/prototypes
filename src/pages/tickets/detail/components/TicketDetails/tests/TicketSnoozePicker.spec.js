import {shallow} from 'enzyme'
import React from 'react'

import TicketSnoozePicker from '../TicketSnoozePicker'

const errorSpy = jest.spyOn(global.console, 'error')
jest.mock('moment', () => {
    return (value) => require.requireActual('moment')(value || '2017-12-22')
})

describe('<TicketSnoozePicker/>', () => {
    const minProps = {
        isOpen: false,
        onApply: jest.fn(),
        toggle: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it.each(['2018-10-26', null])('should render a DatePicker', (datetime) => {
        const component = shallow(<TicketSnoozePicker
            {...minProps}
            datetime={datetime}
        />)

        expect(component).toMatchSnapshot()
        expect(errorSpy).not.toHaveBeenCalled()
    })

    it('should render a DatePicker and log error when datetime has a wrong format', () => {
        const component = shallow(<TicketSnoozePicker
            {...minProps}
            datetime="foo"
        />)

        expect(component).toMatchSnapshot()
        expect(errorSpy).toHaveBeenCalled()
    })
})
